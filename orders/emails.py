from django.core.mail import send_mail
from django.conf import settings


def send_email_safe(subject, message, recipient):
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=True
        )
    except Exception as e:
        print(f"Email failed silently: {e}")


def send_order_created_email(order):
    items_list = "\n".join([
        f"- {item.quantity}x {item.product_name} @ ₦{item.product_price}"
        for item in order.items.all()
    ])
    subject = f"Order Confirmed - {order.tracking_code}"
    message = f"""
Hi {order.full_name},

Your order has been placed successfully!

Tracking Code: {order.tracking_code}
Status: Pending
Total: ₦{order.total_amount}

Items Ordered:
{items_list}

Delivery Address:
{order.address}, {order.city}, {order.state}, {order.country}

Thank you for shopping with Pulse Parcel Limited!
    """
    send_email_safe(subject, message, order.email)


def send_out_for_delivery_email(order):
    subject = f"Your Order {order.tracking_code} is Out for Delivery!"
    message = f"""
Hi {order.full_name},

Your order is on its way!

Tracking Code: {order.tracking_code}
Status: Out for Delivery

Your parcel is currently out for delivery and should arrive soon.

Delivery Address:
{order.address}, {order.city}, {order.state}, {order.country}

Thank you for your patience!
    """
    send_email_safe(subject, message, order.email)


def send_delivered_email(order):
    items_list = "\n".join([
        f"- {item.quantity}x {item.product_name}"
        for item in order.items.all()
    ])
    subject = f"Order {order.tracking_code} Delivered!"
    message = f"""
Hi {order.full_name},

Your order has been delivered successfully!

Tracking Code: {order.tracking_code}
Status: Delivered

Items Delivered:
{items_list}

Thank you for shopping with Pulse Parcel Limited!
    """
    send_email_safe(subject, message, order.email)



    