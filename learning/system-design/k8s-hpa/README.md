# Kubernetes HPA Simulator

## Overview
This project demonstrates how Kubernetes Horizontal Pod Autoscaling (HPA) works. It includes a Python web application that exposes a CPU-intensive endpoint, along with the necessary Kubernetes manifests to deploy the application and configure an HPA policy.

## Architecture
- **Web App**: A simple Flask application running on Python 3.11. The `/work` endpoint calculates primes to intentionally consume CPU cycles. The `/health` endpoint is for liveness/readiness probes.
- **Deployment**: Manages the pods. Importantly, it specifies CPU resource *requests*.
- **Service**: Exposes the pods internally within the cluster.
- **HPA**: Monitors the CPU utilization of the pods and scales the number of replicas dynamically.

## How to Run
1. **Prerequisites**: A Kubernetes cluster (e.g., minikube, kind, or Docker Desktop) with the `metrics-server` installed.
2. **Build the image**:
   ```bash
   docker build -t hpa-simulator:latest .
   ```
   *(If using minikube or kind, make sure to load the image into the cluster)*
3. **Deploy the application**:
   ```bash
   kubectl apply -f deployment.yaml
   ```
4. **Deploy the HPA**:
   ```bash
   kubectl apply -f hpa.yaml
   ```
5. **Port-forward the service (optional, for local testing)**:
   ```bash
   kubectl port-forward svc/hpa-simulator-service 8080:80
   ```
6. **Generate Load**:
   Run the provided `load.sh` script to send traffic to the app.
   ```bash
   ./load.sh http://localhost:8080/work
   ```
7. **Observe Scaling**:
   Watch the HPA and pods scale up:
   ```bash
   kubectl get hpa -w
   kubectl get pods -w
   ```

## Key Concepts

### Horizontal Pod Autoscaler (HPA)
The HPA automatically updates a workload resource (such as a Deployment or StatefulSet), with the aim of automatically scaling the workload to match demand. In this simulator, we scale based on CPU utilization.

### Metrics-Server
The HPA relies on metrics collected from the pods. The `metrics-server` is a cluster-wide aggregator of resource usage data. Without the `metrics-server` (or a similar custom metrics pipeline), the HPA cannot retrieve CPU or memory usage, and auto-scaling will not work.

### Resource Requests
For the HPA to calculate CPU utilization percentage, the pods MUST have resource requests configured.
The formula for utilization is: `(Current CPU Usage) / (CPU Request)`.
If `resources.requests.cpu` is missing in the container spec, the HPA cannot calculate the percentage and scaling will fail with "unknown" metrics.

## Interview Q&A

**Q: What is the purpose of the metrics-server in Kubernetes HPA?**
A: The metrics-server collects resource metrics (like CPU and memory usage) from the kubelets on each node and exposes them via the Metrics API. The HPA controller queries this API to determine if a scaling action is required. Without it, standard resource-based scaling doesn't work.

**Q: Why are resource requests essential for CPU-based HPA?**
A: HPA uses the specified resource requests as the denominator when calculating resource utilization percentages. If a pod doesn't have a CPU request defined, the HPA cannot compute the current CPU utilization percentage and will not be able to scale the deployment.

**Q: What happens if an application spikes CPU very briefly? Will HPA scale it instantly?**
A: Not instantly. HPA periodically queries metrics (by default every 15 seconds) and calculates averages over a window to avoid thrashing (scaling up and down rapidly). There is also a cooldown period after scaling events before it will scale down again.

**Q: Can HPA scale based on custom metrics (e.g., messages in a queue)?**
A: Yes. While native HPA supports CPU and Memory, it can also scale based on custom metrics (like HTTP requests/sec or queue length) if you configure a custom metrics API server, often using tools like Prometheus Adapter or KEDA.
