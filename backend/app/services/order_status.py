from app.models.all_models import OrderStatus

class OrderStatusMachine:
    # Defining the valid directed acyclic graph (DAG) for status transitions
    VALID_TRANSITIONS = {
        OrderStatus.PLACED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        OrderStatus.CONFIRMED: [OrderStatus.PICKUP_SCHEDULED, OrderStatus.CANCELLED],
        OrderStatus.PICKUP_SCHEDULED: [OrderStatus.PICKED_UP],
        OrderStatus.PICKED_UP: [OrderStatus.RECEIVED], # Note: Once picked up, cancellation is restricted
        OrderStatus.RECEIVED: [OrderStatus.PROCESSING],
        OrderStatus.PROCESSING: [OrderStatus.WASHING, OrderStatus.DRYING, OrderStatus.IRONING, OrderStatus.QUALITY_CHECK],
        OrderStatus.WASHING: [OrderStatus.DRYING],
        OrderStatus.DRYING: [OrderStatus.IRONING, OrderStatus.QUALITY_CHECK],
        OrderStatus.IRONING: [OrderStatus.QUALITY_CHECK],
        OrderStatus.QUALITY_CHECK: [OrderStatus.READY_FOR_DELIVERY, OrderStatus.PROCESSING], # Can go back if quality fails
        OrderStatus.READY_FOR_DELIVERY: [OrderStatus.OUT_FOR_DELIVERY],
        OrderStatus.OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
        OrderStatus.DELIVERED: [],
        OrderStatus.CANCELLED: []
    }

    @classmethod
    def can_transition(cls, current_status: OrderStatus, new_status: OrderStatus) -> bool:
        """Returns True if the transition is allowed according to the business rules."""
        if current_status == new_status:
            return False
        
        allowed_next_states = cls.VALID_TRANSITIONS.get(current_status, [])
        return new_status in allowed_next_states

    @classmethod
    def can_customer_cancel(cls, current_status: OrderStatus) -> bool:
        """Customers can only cancel before the items are picked up."""
        return current_status in [
            OrderStatus.PLACED, 
            OrderStatus.CONFIRMED, 
            OrderStatus.PICKUP_SCHEDULED
        ]
