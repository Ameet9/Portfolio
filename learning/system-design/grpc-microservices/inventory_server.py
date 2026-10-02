import grpc
from concurrent import futures
import time
import random
import logging

import inventory_pb2
import inventory_pb2_grpc

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

class InventoryServicer(inventory_pb2_grpc.InventoryServicer):
    """Provides methods that implement functionality of inventory server."""
    
    def __init__(self):
        # Mock database of inventory items
        self.inventory_db = {
            "ITEM001": 50,
            "ITEM002": 0,
            "ITEM003": 12,
        }

    def CheckStock(self, request, context):
        """Unary RPC: Client sends a single request and gets a single response."""
        logging.info(f"Received CheckStock request for item: {request.item_id}")
        quantity = self.inventory_db.get(request.item_id, 0)
        return inventory_pb2.StockResponse(
            item_id=request.item_id,
            quantity=quantity,
            in_stock=quantity > 0
        )

    def WatchStock(self, request, context):
        """Server Streaming RPC: Client sends a single request and gets a stream of responses."""
        logging.info(f"Received WatchStock request for item: {request.item_id}")
        # Keep sending updates as long as the client is connected
        # In a real app, this would be event-driven. Here we simulate updates with a loop.
        current_quantity = self.inventory_db.get(request.item_id, 0)
        
        try:
            for _ in range(5):  # Limit to 5 updates for demonstration
                # Check if client cancelled the RPC
                if not context.is_active():
                    logging.info("Client cancelled the WatchStock stream")
                    break
                    
                yield inventory_pb2.StockResponse(
                    item_id=request.item_id,
                    quantity=current_quantity,
                    in_stock=current_quantity > 0
                )
                
                # Simulate stock changes over time
                time.sleep(2)
                current_quantity = max(0, current_quantity + random.randint(-5, 5))
                self.inventory_db[request.item_id] = current_quantity
                
        except Exception as e:
            logging.error(f"Error in WatchStock: {e}")

def serve():
    """Starts the gRPC server."""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    inventory_pb2_grpc.add_InventoryServicer_to_server(InventoryServicer(), server)
    
    # Listen on port 50051
    server.add_insecure_port('[::]:50051')
    server.start()
    logging.info("Inventory gRPC Server started on port 50051.")
    
    try:
        # Keep server running since server.start() is non-blocking
        server.wait_for_termination()
    except KeyboardInterrupt:
        logging.info("Shutting down server...")
        server.stop(0)

if __name__ == '__main__':
    serve()
