import stripe
from django.conf import settings
from django.http import Http404
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from core.models import (
    Item,
    OrderItem,
    Order,
    UserProfile,
    Payment,
    Coupon
)
from .serializers import (
    ItemSerializer,
    OrderSerializer,
    ItemDetailSerializer
)


stripe.api_key = settings.STRIPE_SECRET_KEY


class ItemListAPIView(generics.ListAPIView):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()
    permission_classes = [AllowAny]


class ItemDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ItemDetailSerializer
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
            raise Http404(_("You do not have an active order"))


class PaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        order = Order.objects.get(user=request.user, ordered=False)
        userprofile = UserProfile.objects.get(user=request.user)

        token = request.data.get('stripeToken')
        # save = request.POST.get('save')
        # use_default = request.POST.get('use_default')
        save = False
        use_default = False

        if save:
            # allow to fetch cards
            if not userprofile.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    source=token
                )

                userprofile.stripe_customer_id = customer['id']
                userprofile.one_click_purchasing = True
                userprofile.save()
            else:
                stripe.Customer.create_source(
                    userprofile.stripe_customer_id,
                    source=token
                )

        amount = int(order.get_total() * 100)  # cents

        try:
            # Use Stripe's library to make requests
            if use_default:
                charge = stripe.Charge.create(
                    amount=amount,  # cents
                    currency='usd',
                    customer=userprofile.stripe_customer_id
                )
            else:
                charge = stripe.Charge.create(
                    amount=amount,  # cents
                    currency='usd',
                    source=token
                )

            # create the payment
            payment = Payment.objects.create(
                stripe_charge_id=charge['id'],
                user=request.user,
                amount=order.get_total()
            )

            order.ordered = True
            order.payment = payment
            # order.ref_code = create_ref_code()
            order.save()

            order_items = order.items.all()
            order_items.update(ordered=True)
            for item in order_items:
                item.save()

            return Response(status=status.HTTP_200_OK)

        except stripe.error.CardError as e:
            # Since it's a decline, stripe.error.CardError will be caught
            body = e.json_body
            err = body.get('error', {})
            return Response({
                "message": err.get('message')
            }, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.RateLimitError as e:
            # Too many requests made to the API too quickly
            return Response({
                "message": "Rate limit error."
            }, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.InvalidRequestError as e:
            # Invalid parameters were supplied to Stripe's API
            return Response({
                "message": "Invalid parameters."
            }, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.AuthenticationError as e:
            # Authentication with Stripe's API failed
            # (maybe you changed API keys recently)
            return Response({
                "message": "Not authenticated."
            }, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.APIConnectionError as e:
            # Network communication with Stripe failed
            return Response({
                "message": "Network error."
            }, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.StripeError as e:
            return Response({
                "message":
                "Something went wrong. You were not charged. Plase try again."
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "message": "A serious error occurred. We have been notified."
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": "Invalid data received"
        }, status=status.HTTP_400_BAD_REQUEST)


class AddCouponAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        code = request.data.get('code', None)
        if code is None:
            return Response({
                'message': _('Invalid data received')
            }, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.get(user=request.user, ordered=False)
        coupon = get_object_or_404(Coupon, code=code)
        order.coupon = coupon
        order.save()
        return Response(status=status.HTTP_200_OK)
