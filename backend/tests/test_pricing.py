from app.services.pricing import PricingEngine

def test_pricing_calculation(db):
    # This tests the pure logic of the pricing engine
    result = PricingEngine.calculate_order_total(
        db=db,
        service_ids=[], # Assuming no extra service base fees for this basic test
        items=[
            {"item_name": "Shirt", "quantity": 5},
            {"item_name": "Pants", "quantity": 2}
        ],
        is_express=False
    )
    
    # 7 items * 2.0 baseline = 14.0
    assert result["subtotal"] == 14.0
    # Tax = 10% = 1.4
    assert result["tax"] == 1.4
    # Under $50, so delivery fee = 5.0
    assert result["delivery_fee"] == 5.0
    assert result["express_fee"] == 0.0
    
    # Total = 14.0 + 1.4 + 5.0 + 0 = 20.4
    assert result["total"] == 20.4

def test_express_pricing(db):
    result = PricingEngine.calculate_order_total(
        db=db,
        service_ids=[],
        items=[{"item_name": "Shirt", "quantity": 1}],
        is_express=True
    )
    assert result["express_fee"] == 15.0
