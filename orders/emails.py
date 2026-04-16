from django.core.mail import send_mail
from django.conf import settings


def send_order_created_email(order):
    items_list = "\n".join([
        f"- {item.quantity}x {item.product_name} @ ₦{item.product_price}"
        for item in order.items.all()
    ])
    subject = f"Order Confirmed - {order.tracking_code}"
    message = f"""
Hi {order.full_name},

Your order has been placed successfully! 🎉

Order Details:
--------------
Tracking Code: {order.tracking_code}
Status: Pending
Total: ₦{order.total_amount}

Items Ordered:
{items_list}

Delivery Address:
{order.address}, {order.city}, {order.state}, {order.country}

You can track your order using your tracking code: {order.tracking_code}

Thank you for shopping with us!
    """
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [order.email])


def send_out_for_delivery_email(order):
    subject = f"Your Order {order.tracking_code} is Out for Delivery! 🚚"
    message = f"""
Hi {order.full_name},

Great news! Your order is on its way to you.

Order Details:
--------------
Tracking Code: {order.tracking_code}
Status: Out for Delivery

Your parcel is currently out for delivery and should arrive soon.
Please ensure someone is available to receive it at:

{order.address}, {order.city}, {order.state}, {order.country}

Thank you for your patience!
    """
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [order.email])


def send_delivered_email(order):
    items_list = "\n".join([
        f"- {item.quantity}x {item.product_name}"
        for item in order.items.all()
    ])
    subject = f"Order {order.tracking_code} Delivered! ✅"
    message = f"""
Hi {order.full_name},

Your order has been delivered successfully! 🎉

Order Details:
--------------
Tracking Code: {order.tracking_code}
Status: Delivered

Items Delivered:
{items_list}

We hope you enjoy your purchase! If you have any issues,
please don't hesitate to contact us.

Thank you for shopping with us!
    """
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [order.email])



    