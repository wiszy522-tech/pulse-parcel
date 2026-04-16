from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.conf import settings
from .models import Product, Category, ProductLike
from .serializers import ProductSerializer, CategorySerializer
from .permissions import IsAdminOrReadOnly


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class ProductListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminOrReadOnly()]

    def get(self, request):
        cache_key = 'product_list'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        products = Product.objects.all().order_by('-created_at')
        serializer = ProductSerializer(products, many=True, context={'request': request})
        cache.set(cache_key, serializer.data, timeout=settings.CACHE_TTL)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated or not request.user.is_admin:
            return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            cache.delete('product_list')  # Clear cache on new product
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminOrReadOnly()]

    def perform_update(self, serializer):
        serializer.save()
        cache.delete('product_list')

    def perform_destroy(self, instance):
        instance.delete()
        cache.delete('product_list')


class ProductLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        like, created = ProductLike.objects.get_or_create(
            user=request.user,
            product=product
        )
        if not created:
            like.delete()
            cache.delete('product_list')
            return Response({'message': 'Product unliked'})
        cache.delete('product_list')
        return Response({'message': 'Product liked'}, status=status.HTTP_201_CREATED)
    


    