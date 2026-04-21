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

        system_prompt = f"""You are a smart and friendly account manager assistant for Pulse Parcel Limited, a product ordering and parcel tracking platform.

You are currently speaking with: {user.full_name or user.email}
Account email: {user.email}
Account role: {user.role}

Their account stats:
- Total Orders: {total_orders}
- Pending: {pending}
- Processing: {processing}
- Out for Delivery: {out_for_delivery}
- Delivered: {delivered}
- Total Amount Spent: N{total_spent}

Their 5 most recent orders:
{recent_orders_text}

You can help them with:
- Their order history and stats
- Tracking specific orders by tracking code
- Payment and delivery questions
- How to use the app
- Account management questions
- Product browsing and ordering help

Be warm, friendly and conversational. Address them by their first name when appropriate.
If they ask about a specific tracking code, tell them the status from their order list above if it exists.
If asked something unrelated to Pulse Parcel Limited, politely redirect them.
Keep responses concise and helpful."""

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
        




        



