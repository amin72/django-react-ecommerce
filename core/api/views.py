from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from core.models import Item, OrderItem, Order
from .serializers import ItemSerializer, OrderSerializer


class ItemListAPIView(generics.ListAPIView):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()
    permission_classes = [AllowAny]


class AddToCartAPIView(APIView):
    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        if slug is None:
            return Response({
                "message": _('Invalid request')
            }, status=status.HTTP_400_BAD_REQUEST)

        item = get_object_or_404(Item, slug=slug)
        order_item, created = OrderItem.objects.get_or_create(item=item,
            user=request.user,
            ordered=False)
        
        order_qs = Order.objects.filter(user=request.user, ordered=False)

        if order_qs.exists():
            order = order_qs[0]
            # check if the order item in the order
            if order.items.filter(item__slug=item.slug).exists():
                order_item.quantity += 1
                order_item.save()
                return Response(status.HTTP_200_OK)
            else:
                order_item.quantity = 1
                order_item.save()
                order.items.add(order_item)
                return Response(status.HTTP_200_OK)
        else:
            ordered_date = timezone.now()
            order = Order.objects.create(user=request.user,
                ordered_date=ordered_date)
            order.items.add(order_item)
            return Response(status.HTTP_200_OK)


class OrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            order = Order.objects.get(user=self.request.user, ordered=False)
            return order
        except Order.DoesNotExist:
            return Response({
                "message": _("You do not have an active order")
            }, status=status.HTTP_400_BAD_REQUEST)
