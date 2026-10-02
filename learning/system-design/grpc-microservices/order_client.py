import grpc
import logging
import inventory_pb2
import inventory_pb2_grpc

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

def run_unary_call(stub, item_id):
    """Executes the CheckStock unary RPC."""
    logging.info(f"--- Calling Unary RPC CheckStock for {item_id} ---")
    try:
        # Client sends a single request and blocks waiting for a single response
        response = stub.CheckStock(inventory_pb2.StockRequest(item_id=item_id))
        logging.info(f"CheckStock Response:")
        logging.info(f"  Item: {response.item_id}")
        logging.info(f"  Quantity: {response.quantity}")
        logging.info(f"  In Stock: {response.in_stock}\n")
    except grpc.RpcError as e:
        logging.error(f"RPC failed: {e.code()} - {e.details()}")

def run_server_streaming_call(stub, item_id):
    """Executes the WatchStock server streaming RPC."""
    logging.info(f"--- Calling Server Streaming RPC WatchStock for {item_id} ---")
    try:
        # Client sends a single request and gets an iterator to read a stream of responses
        responses = stub.WatchStock(inventory_pb2.StockRequest(item_id=item_id))
        for response in responses:
            logging.info(f"Stock Update Received -> Item: {response.item_id}, Qty: {response.quantity}, In Stock: {response.in_stock}")
    except grpc.RpcError as e:
        logging.error(f"RPC failed: {e.code()} - {e.details()}")
    logging.info("WatchStock stream ended.\n")

def run():
    """Main client execution block."""
    # Connect to the gRPC server running on localhost:50051
    # Using an insecure channel for demonstration (no TLS/mTLS)
    with grpc.insecure_channel('localhost:50051') as channel:
        # Create a stub (client)
        stub = inventory_pb2_grpc.InventoryStub(channel)
        
        # Test Unary Call
        run_unary_call(stub, "ITEM001")
        run_unary_call(stub, "ITEM002")
        
        # Test Server Streaming Call
        run_server_streaming_call(stub, "ITEM003")

if __name__ == '__main__':
    run()
