from rest_framework import serializers
from django.contrib.auth import get_user_model
import urllib.parse

User = get_user_model()


def get_avatar_url(email):
    seed = urllib.parse.quote(email)
    return f"https://api.dicebear.com/7.x/initials/svg?seed={seed}"


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'confirm_password']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['avatar'] = get_avatar_url(validated_data['email'])
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'avatar', 'date_joined']
        read_only_fields = ['id', 'role', 'date_joined']



        