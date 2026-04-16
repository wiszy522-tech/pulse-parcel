from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListCreateView.as_view(), name='product_list'),
    path('<uuid:pk>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('<uuid:pk>/like/', views.ProductLikeView.as_view(), name='product_like'),
    path('categories/', views.CategoryListCreateView.as_view(), name='category_list'),
]

