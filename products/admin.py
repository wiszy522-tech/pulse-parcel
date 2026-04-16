from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Product, Category, ProductLike


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock', 'is_available', 'uploaded_by', 'created_at']
    list_filter = ['is_available', 'category']
    search_fields = ['name', 'description']


@admin.register(ProductLike)
class ProductLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']



    