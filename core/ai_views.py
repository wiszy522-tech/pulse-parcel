from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import requests
from django.conf import settings


SYSTEM_PROMPT = """You are a helpful assistant for Pulse Parcel Limited, a product ordering and parcel tracking web app.

You can only answer questions related to:
- How to place an order
- How to track a parcel
- How to make payments via Paystack
- How to create an account or login with email or Google
- Order statuses (pending, processing, out for delivery, delivered)
- Product browsing and liking
- Account and profile management

If a user asks anything unrelated to the app, politely tell them you can only assist with Pulse-Parcel-Limited related questions.

Be friendly, concise and helpful."""


class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get('message')
        if not question:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
                        {'role': 'system', 'content': SYSTEM_PROMPT},
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
                print(f"Groq error: {data}")  # add this
                return Response(
                    {'error': 'AI service unavailable', 'detail': data},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

        except Exception as e:
            print(f"Chatbot exception: {str(e)}")  # add this
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        






