from django.urls import path
from . import views


urlpatterns = [
    # product list
    path('products/', views.ItemListAPIView.as_view(), name='product_list'),

    # product detail
    path('products/<int:pk>/', views.ItemDetailAPIView.as_view(),
         name='product_detail'),

    # add to cart
    path('add-to-cart/', views.AddToCartAPIView.as_view(), name='add_to_cart'),

    # order summary
    path('order-summary/', views.OrderDetailAPIView.as_view(),
         name='order_summary'),

    # checkout
    path('checkout/', views.PaymentAPIView.as_view(), name='checkout'),

    # add coupon
    path('add-coupon/', views.AddCouponAPIView.as_view(), name='add_coupon'),

    # address list
    path('addresses/', views.AddressListAPIView.as_view(),
         name='address_list'),

    # create address
    path('addresses/create/', views.AddressCreateAPIView.as_view(),
         name='address_create'),

    # country list
    path('countries/', views.CountryListAPIView.as_view(),
         name='country_list'),
]
