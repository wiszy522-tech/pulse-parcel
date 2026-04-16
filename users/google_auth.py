import requests as http_requests
from django.contrib.auth import get_user_model
from .serializers import get_avatar_url

User = get_user_model()


def verify_google_token(token):
    try:
        
        response = http_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        if response.status_code == 200:
            return response.json()
        return None
    except Exception:
        return None


def get_or_create_google_user(idinfo):
    email = idinfo.get('email')
    full_name = idinfo.get('name', '')

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'full_name': full_name,
            'avatar': idinfo.get('picture') or get_avatar_url(email),
            'is_active': True,
        }
    )

    if created:
        user.set_unusable_password()
        user.save()

    return user, created


    