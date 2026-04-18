from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Order, OrderStatusHistory
from .serializers import CreateOrderSerializer, OrderSerializer
from .emails import send_order_created_email, send_out_for_delivery_email, send_delivered_email
import requests
import uuid

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save(user=request.user)

            # Initialize Paystack payment
            paystack_data = {
                'email': order.email,
                'amount': int(order.total_amount * 100),  # Paystack uses kobo
                'reference': str(uuid.uuid4()),
                'callback_url': f"{settings.FRONTEND_URL}/payment/verify",
                'metadata': {
                    'order_id': str(order.id),
                    'tracking_code': order.tracking_code,
                }
            }

            headers = {
                'Authorization': f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                'Content-Type': 'application/json'
            }

            paystack_response = requests.post(
                'https://api.paystack.co/transaction/initialize',
                json=paystack_data,
                headers=headers
            )

            paystack_result = paystack_response.json()

            if paystack_result.get('status'):
                order.paystack_reference = paystack_data['reference']
                order.save()

                return Response({
                    'message': 'Order created successfully',
                    'order': OrderSerializer(order).data,
                    'payment_url': paystack_result['data']['authorization_url'],
                    'reference': paystack_data['reference']
                }, status=status.HTTP_201_CREATED)
            else:
                order.delete()
                return Response(
                    {'error': 'Failed to initialize payment'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyPaymentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, reference):
        headers = {
            'Authorization': f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        }
        try:
            paystack_response = requests.get(
                f'https://api.paystack.co/transaction/verify/{reference}',
                headers=headers
            )
            result = paystack_response.json()

            if result.get('status') and result['data']['status'] == 'success':
                try:
                    order = Order.objects.get(paystack_reference=reference)
                except Order.DoesNotExist:
                    return Response(
                        {'error': 'Order not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                if order.payment_status != 'paid':
                    order.payment_status = 'paid'
                    order.status = 'processing'
                    order.save()

                    OrderStatusHistory.objects.create(
                        order=order,
                        status='processing',
                        note='Payment confirmed'
                    )

                    try:
                        send_order_created_email(order)
                    except Exception as e:
                        print(f"Email error: {e}")

                return Response({
                    'message': 'Payment verified successfully',
                    'order': OrderSerializer(order).data
                })

            return Response(
                {'error': 'Payment verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Verify error: {e}")
            return Response(
                {'error': 'Verification error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Order.objects.all()
        return Order.objects.filter(user=user)


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Order.objects.all()
        return Order.objects.filter(user=user)


class TrackOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tracking_code):
        order = get_object_or_404(Order, tracking_code=tracking_code)

        # Only allow owner or admin
        if order.user != request.user and not request.user.is_admin:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(OrderSerializer(order).data)


class ScanParcelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, tracking_code):
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admins can scan parcels'},
                status=status.HTTP_403_FORBIDDEN
            )

        order = get_object_or_404(Order, tracking_code=tracking_code)
        current_status = order.status

        # Status flow: processing -> out_for_delivery -> delivered
        if current_status == 'processing':
            order.status = 'out_for_delivery'
            order.save()

            OrderStatusHistory.objects.create(
                order=order,
                status='out_for_delivery',
                note='Parcel scanned - out for delivery',
                updated_by=request.user
            )

            try:
                send_out_for_delivery_email(order)
            except Exception as e:
                print(f"Email error: {e}")

            return Response({
                'message': 'Parcel scanned - marked as out for delivery',
                'order': OrderSerializer(order).data
            })

        elif current_status == 'out_for_delivery':
            order.status = 'delivered'
            order.save()

            OrderStatusHistory.objects.create(
                order=order,
                status='delivered',
                note='Parcel scanned - delivered',
                updated_by=request.user
            )

            try:
                send_delivered_email(order)
            except Exception as e:
                print(f"Email error: {e}")

            return Response({
                'message': 'Parcel scanned - marked as delivered',
                'order': OrderSerializer(order).data
            })

        else:
            return Response(
                {'error': f'Cannot scan parcel with status: {current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        


        