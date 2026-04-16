from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'subtotal']
        read_only_fields = ['product_name', 'product_price']


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'note', 'timestamp']


class CreateOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'full_name', 'email', 'phone', 'address',
            'city', 'state', 'postal_code', 'country', 'items'
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('Order must have at least one item')
        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        total = 0

        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']

            if product.stock < quantity:
                raise serializers.ValidationError(
                    f'Insufficient stock for {product.name}'
                )

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_price=product.price,
                quantity=quantity
            )
            total += product.price * quantity
            product.stock -= quantity
            product.save()

        order.total_amount = total
        order.save()

        OrderStatusHistory.objects.create(
            order=order,
            status='pending',
            note='Order created'
        )

        return order


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'tracking_code', 'status', 'payment_status',
            'full_name', 'email', 'phone', 'address', 'city',
            'state', 'postal_code', 'country', 'total_amount',
            'items', 'status_history', 'created_at'
        ]
        read_only_fields = ['id', 'tracking_code', 'status', 'payment_status', 'created_at']




        