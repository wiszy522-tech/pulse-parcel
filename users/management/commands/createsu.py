from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    def handle(self, *args, **options):
        User = get_user_model()
        email = 'alexi522@gmail.com'
        password = 'Admin@12345'
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password)
            self.stdout.write(f'Superuser {email} created')
        else:
            self.stdout.write(f'Superuser {email} already exists')



            