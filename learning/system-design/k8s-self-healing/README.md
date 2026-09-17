# Kubernetes Self-Healing Pods

## Overview
Kubernetes uses a declarative model where you define the **desired state** (e.g., "I want 3 replicas of my app"), and the Kubernetes control plane continuously runs a **reconciliation loop** to ensure the **actual state** matches the desired state. 

Self-healing is a core feature of Kubernetes. If a Pod crashes, is deleted, or becomes unresponsive, Kubernetes automatically replaces it or restarts it to maintain the desired number of healthy Pods.

This project demonstrates Kubernetes self-healing mechanisms using a simple Python Flask API with `livenessProbe` and `readinessProbe` configured.

## Architecture
- **Flask API**: A simple stateless web application that returns its hostname (Pod name) and environment variables injected via a ConfigMap. It includes a `/health` endpoint.
- **ConfigMap**: Provides configuration (environment variables) decoupled from the application code.
- **Deployment**: Manages a ReplicaSet of 3 Pods, defining the container image and health probes.
- **Service**: Exposes the Pods via a stable IP and port (NodePort in this case) and load balances traffic across healthy Pods.

## How to Run

1. Start minikube:
   ```powershell
   minikube start
   ```

2. Point your local Docker daemon to minikube's Docker daemon (so Kubernetes can see your local image):
   ```powershell
   # In PowerShell
   minikube docker-env | Invoke-Expression
   ```

3. Build the Docker image:
   ```powershell
   cd app
   docker build -t self-healing-app:v1 .
   cd ..
   ```

4. Apply the Kubernetes manifests:
   ```powershell
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

5. Verify everything is running:
   ```powershell
   kubectl get pods
   kubectl get svc
   ```

6. Access the application:
   ```powershell
   minikube service self-healing-service
   ```

## Walkthrough: Self-Healing

### 1. Killing a Pod Manually
Let's see the reconciliation loop in action by deleting a Pod manually.
Open two terminals.

Terminal 1 (Watch pods):
```powershell
kubectl get pods -w
```

Terminal 2:
```powershell
# Get a pod name from the list
kubectl get pods
# Delete it
kubectl delete pod <pod-name>
```
In Terminal 1, you will immediately see the old pod terminating and a new pod spinning up to replace it, ensuring there are always 3 running pods.

### 2. Failing Liveness Probe
The application has a `/break` endpoint that simulates a crash by making the `/health` endpoint return 500 errors.

```powershell
# Get the minikube IP and NodePort, or use port-forwarding
kubectl port-forward svc/self-healing-service 8080:80
```
In another terminal, hit the break endpoint:
```powershell
curl http://localhost:8080/break
```
Watch the pods (`kubectl get pods -w`). After a few seconds, the `livenessProbe` will fail, and Kubernetes will restart the container automatically. You will see the `RESTARTS` count increment for that Pod.

### 3. Scaling Up and Down
Change the desired state and watch Kubernetes reconcile.
```powershell
kubectl scale deployment self-healing-app --replicas=5
kubectl get pods -w
```
Scale it back down:
```powershell
kubectl scale deployment self-healing-app --replicas=2
```

## Key Concepts
- **Reconciliation Loop**: The continuous process where Kubernetes controllers compare actual state to desired state and make necessary adjustments.
- **Liveness Probes**: Tell Kubernetes if your app is alive or dead. If it fails, Kubernetes kills and restarts the container.
- **Readiness Probes**: Tell Kubernetes if your app is ready to serve traffic. If it fails, Kubernetes stops sending traffic to the Pod (removes it from the Service endpoints) but doesn't kill it.
- **ReplicaSet**: Ensured by the Deployment to maintain the exact number of Pod replicas.

## Interview Q&A

**1. What is the difference between a Liveness Probe and a Readiness Probe?**
A Liveness probe determines if a container is running properly. If it fails, Kubernetes restarts the container. A Readiness probe determines if a container is ready to accept HTTP traffic. If it fails, Kubernetes removes the pod's IP from the service endpoints, so no traffic is routed to it until it recovers, but the container is not restarted.

**2. How does the Kubernetes reconciliation loop work?**
The reconciliation loop is a control loop that constantly watches the state of the cluster. It compares the current state (e.g., 2 pods running) with the desired state specified in the manifests (e.g., 3 pods requested). If there's a drift, the controller takes action to reconcile the difference (e.g., creates 1 more pod).

**3. What happens when a Pod crashes in a Deployment?**
The kubelet notices the container has crashed. The ReplicaSet controller (managed by the Deployment) notices that the actual number of ready replicas is less than the desired number. It immediately requests the scheduling of a new Pod to replace the crashed one, demonstrating self-healing.

**4. Why use a ConfigMap instead of hardcoding environment variables in the Dockerfile?**
ConfigMaps allow you to decouple configuration artifacts from image content. This means you can use the exact same Docker image across different environments (dev, staging, prod) by simply providing a different ConfigMap for each environment, adhering to Twelve-Factor App principles.

**5. If I want to update the image version, how does a Deployment handle it without downtime?**
Deployments use a Rolling Update strategy by default. When you update the image (e.g., `kubectl set image`), the Deployment creates a new ReplicaSet. It slowly scales up the new ReplicaSet while scaling down the old one, ensuring that a certain number of pods are always available to serve traffic, achieving zero-downtime deployments.
