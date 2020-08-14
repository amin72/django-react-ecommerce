from django.urls import path
from . import views


urlpatterns = [
    path('product-list/', views.ItemListAPIView.as_view(), name='product-list'),
    path('add-to-cart/', views.AddToCartAPIView.as_view(), name='add-to-cart'),
    path('order-summary/', views.OrderDetailAPIView.as_view(), name='order-summary'),
]