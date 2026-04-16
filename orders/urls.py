from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order_list'),
    path('create/', views.CreateOrderView.as_view(), name='create_order'),
    path('<uuid:pk>/', views.OrderDetailView.as_view(), name='order_detail'),
    path('track/<str:tracking_code>/', views.TrackOrderView.as_view(), name='track_order'),
    path('verify-payment/<str:reference>/', views.VerifyPaymentView.as_view(), name='verify_payment'),
    path('scan/<str:tracking_code>/', views.ScanParcelView.as_view(), name='scan_parcel'),
]


