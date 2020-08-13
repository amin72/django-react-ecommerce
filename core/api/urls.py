from django.urls import path
from . import views


urlpatterns = [
    path('product-list/', views.ItemListAPIView.as_view(), name='product-list'),
]