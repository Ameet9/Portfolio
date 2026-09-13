from union_find import UnionFind

class NetworkMonitor:
    """
    A network connectivity checker that wraps the UnionFind data structure.
    Allows for mapping string-based server names to integer IDs used by UnionFind.
    """
    
    def __init__(self):
        # We start with 0 servers, but since UnionFind requires a fixed size,
        # we'll use a dynamic approach by mapping names and resizing if necessary,
        # or we can just lazily initialize elements.
        # Actually, standard UnionFind uses an array. We will manage a dict 
        # mapping server name -> int id, and use a list-based or dict-based parent array.
        # For simplicity, let's implement a dynamic UF inside this class.
        self.server_to_id = {}
        self.id_to_server = {}
        self.uf = None
        self._temp_connections = []
        self._servers = set()
        
    def _ensure_initialized(self):
        """Initializes the underlying UnionFind when the total nodes are known."""
        if self.uf is None and self.server_to_id:
            self.uf = UnionFind(len(self.server_to_id))
            for u_id, v_id in self._temp_connections:
                self.uf.union(u_id, v_id)
            self._temp_connections = []
            
    def _register_server(self, name: str) -> int:
        if name not in self.server_to_id:
            server_id = len(self.server_to_id)
            self.server_to_id[name] = server_id
            self.id_to_server[server_id] = name
            self._servers.add(name)
            # If we add servers dynamically, we'd need to re-init UF. 
            # We'll just do it eagerly and recreate if needed, or handle dynamically.
            # To stick to our UnionFind class, we'll recreate the UF structure and replay,
            # or just use a large enough initial size. Let's do replay for correctness.
            self.uf = None 
        return self.server_to_id[name]

    def add_connection(self, server_a: str, server_b: str):
        """
        Adds a network connection between two servers.
        
        Args:
            server_a (str): Name of the first server.
            server_b (str): Name of the second server.
        """
        a_id = self._register_server(server_a)
        b_id = self._register_server(server_b)
        self._temp_connections.append((a_id, b_id))
        if self.uf is not None:
            self.uf.union(a_id, b_id)
        else:
            self._ensure_initialized()
            
    def are_connected(self, server_a: str, server_b: str) -> bool:
        """
        Checks if two servers can communicate with each other (direct or indirect).
        
        Args:
            server_a (str): Name of the first server.
            server_b (str): Name of the second server.
            
        Returns:
            bool: True if they are connected, False otherwise.
        """
        self._ensure_initialized()
        if server_a not in self.server_to_id or server_b not in self.server_to_id:
            return False
        return self.uf.connected(self.server_to_id[server_a], self.server_to_id[server_b])
        
    def get_partition_count(self) -> int:
        """
        Returns the number of disjoint networks.
        
        Returns:
            int: Number of disconnected components.
        """
        self._ensure_initialized()
        if not self.server_to_id:
            return 0
        return self.uf.component_count()

if __name__ == "__main__":
    monitor = NetworkMonitor()
    
    print("Adding connection: WebServer1 <-> AppServer1")
    monitor.add_connection("WebServer1", "AppServer1")
    
    print("Adding connection: AppServer1 <-> DBServer1")
    monitor.add_connection("AppServer1", "DBServer1")
    
    print("Adding connection: WebServer2 <-> DBServer2")
    monitor.add_connection("WebServer2", "DBServer2")
    
    print(f"WebServer1 and DBServer1 connected? {monitor.are_connected('WebServer1', 'DBServer1')}")
    print(f"WebServer1 and WebServer2 connected? {monitor.are_connected('WebServer1', 'WebServer2')}")
    print(f"Total isolated networks: {monitor.get_partition_count()}")
