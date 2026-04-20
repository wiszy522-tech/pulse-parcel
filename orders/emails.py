from django.core.mail import send_mail
from django.conf import settings
import threading


def send_email_async(subject, message, recipient):
    def send():
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient],
                fail_silently=True
            )
            print(f"Email sent successfully to {recipient}")
        except Exception as e:
            print(f"Email error: {e}")

    thread = threading.Thread(target=send)
    thread.daemon = True
    thread.start()


def send_order_created_email(order):
    items_list = "\n".join([
        f"- {item.quantity}x {item.product_name} @ N{item.product_price}"
        for item in order.items.all()
    ])
    subject = f"Order Confirmed - {order.tracking_code}"
    message = f"""
Hi {order.full_name},

Your order has been placed successfully!

Order Details:
--------------
Tracking Code: {order.tracking_code}
Status: Pending
Total: N{order.total_amount}

Items Ordered:
{items_list}

Delivery Address:
{order.address}, {order.city}, {order.state}, {order.country}

Track your order with code: {order.tracking_code}

Thank you for shopping with Pulse Parcel Limited!
Email: pulseparcelltd@gmail.com
Phone: +234 805 050 1440
    """
    send_email_async(subject, message, order.email)


def send_out_for_delivery_email(order):
    subject = f"Your Order {order.tracking_code} is Out for Delivery!"
    message = f"""
Hi {order.full_name},

Great news! Your order is on its way.

Tracking Code: {order.tracking_code}
Status: Out for Delivery

Please ensure someone is available to receive it at:
{order.address}, {order.city}, {order.state}, {order.country}

Thank you for your patience!
Email: pulseparcelltd@gmail.com
Phone: +234 805 050 1440
    """
    send_email_async(subject, message, order.email)


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
Email: pulseparcelltd@gmail.com
Phone: +234 805 050 1440
    """
    send_email_async(subject, message, order.email)


    
    