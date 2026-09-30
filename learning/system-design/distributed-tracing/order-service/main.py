from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os
from opentelemetry import trace

app = FastAPI()

# Get a tracer
tracer = trace.get_tracer(__name__)
INVENTORY_SERVICE_URL = os.environ.get("INVENTORY_SERVICE_URL", "http://inventory-service:8000")

class OrderRequest(BaseModel):
    item: str
    quantity: int

@app.post("/order")
async def create_order(order: OrderRequest):
    """
    Create a new order. Makes an HTTP call to the inventory service.
    """
    # Create a custom span for processing the order
    with tracer.start_as_current_span("process_order") as span:
        # Add attributes to the span for filtering and context
        span.set_attribute("item.id", order.item)
        span.set_attribute("order.quantity", order.quantity)
        
        async with httpx.AsyncClient() as client:
            try:
                # Call inventory service to check stock
                response = await client.get(f"{INVENTORY_SERVICE_URL}/stock/{order.item}")
                response.raise_for_status()
                stock_data = response.json()
                
                if stock_data.get("stock", 0) >= order.quantity:
                    return {"status": "success", "message": f"Order created for {order.item}", "inventory": stock_data}
                else:
                    span.set_attribute("order.status", "failed - insufficient stock")
                    raise HTTPException(status_code=400, detail="Insufficient stock")
            except httpx.RequestError as exc:
                # Record the exception on the span
                span.record_exception(exc)
                span.set_status(trace.StatusCode.ERROR, "Failed to contact inventory service")
                raise HTTPException(status_code=503, detail="Inventory service unavailable")
