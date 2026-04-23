from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import requests
from django.conf import settings
from orders.models import Order


class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get('message')
        if not question:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        # Gather user account stats
        orders = Order.objects.filter(user=user)
        total_orders = orders.count()
        pending = orders.filter(status='pending').count()
        processing = orders.filter(status='processing').count()
        out_for_delivery = orders.filter(status='out_for_delivery').count()
        delivered = orders.filter(status='delivered').count()
        total_spent = sum(o.total_amount for o in orders.filter(payment_status='paid'))

        recent_orders = orders.order_by('-created_at')[:5]
        recent_orders_text = "\n".join([
            f"- {o.tracking_code} | Status: {o.status.replace('_', ' ').title()} | Amount: N{o.total_amount} | Date: {o.created_at.strftime('%d %b %Y')}"
            for o in recent_orders
        ]) or "No orders yet"

        system_prompt = f"""You are a smart and friendly account manager assistant for Pulse Parcel Limited, a product ordering and parcel tracking platform based in Nigeria.

ABOUT PULSE PARCEL LIMITED:
- Name: Pulse Parcel Limited
- Industry: Logistics, E-commerce, Parcel Delivery
- Mission: Fast, reliable and trackable deliveries right to your doorstep
- Services: Product ordering, parcel delivery, real-time tracking
- Payment: Secured payments via Paystack
- Email: pulseparcelltd@gmail.com
- Phone: +234 805 050 1440, +234 814 077 0540
- WhatsApp: +234 805 050 1440, +234 816 994 4731S
- Tracking: Every order gets a unique tracking code (format: TRK-XXXXXXXX)
- Order Statuses: Pending → Processing → Out for Delivery → Delivered
- Users receive automated email notifications at each delivery stage

HOW IT WORKS:
1. User browses products on the platform
2. User places an order and pays securely via Paystack
3. User receives order confirmation email with tracking code
4. When parcel is dispatched, user receives "Out for Delivery" email
5. When parcel arrives, user receives "Delivered" confirmation email
6. User can track parcel anytime using their tracking code

CURRENT USER:
- Name: {user.full_name or user.email}
- Email: {user.email}
- Role: {user.role}

THEIR ACCOUNT STATS:
- Total Orders: {total_orders}
- Pending: {pending}
- Processing: {processing}
- Out for Delivery: {out_for_delivery}
- Delivered: {delivered}
- Total Amount Spent: N{total_spent}

THEIR 5 MOST RECENT ORDERS:
{recent_orders_text}

YOUR ROLE:
You are a warm, professional account manager. You can:
- Answer questions about Pulse Parcel Limited and its services (just about the company and the app)
- Help users with their orders and tracking
- Explain how the platform works
- Provide account statistics and order history
- Guide users on how to place orders and make payments
- Answer general delivery and logistics questions

Always be friendly, concise and helpful. Address users by their first name when appropriate (only when appropriate don't over use).
If asked something completely unrelated to Pulse Parcel or logistics, politely redirect them."""

        try:
            response = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f"Bearer {settings.GROQ_API_KEY}",
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'llama-3.3-70b-versatile',
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': question}
                    ],
                    'max_tokens': 1024,
                    'temperature': 0.7
                }
            )

            data = response.json()

            if response.status_code == 200:
                answer = data['choices'][0]['message']['content']
                return Response({'answer': answer})
            else:
                print(f"Groq error: {data}")
                return Response(
                    {'error': 'AI service unavailable'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

        except Exception as e:
            print(f"Chatbot error: {e}")
            return Response(
                {'error': 'Something went wrong'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        




        



