from django.urls import path
from . import views


urlpatterns = [
    path('product-list/', views.ItemListAPIView.as_view(), name='product_list'),
    path('add-to-cart/', views.AddToCartAPIView.as_view(), name='add_to_cart'),
    path('order-summary/', views.OrderDetailAPIView.as_view(), name='order_summary'),
    path('checkout/', views.PaymentAPIView.as_view(), name='checkout'),
    path('add-coupon/', views.AddCouponAPIView.as_view(), name='add_coupon'),
]