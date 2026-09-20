# Blue-Green Deployment Simulator

## Overview
This project simulates a Blue-Green deployment strategy using Docker Compose, Nginx, and two simple Flask services representing the "blue" (current) and "green" (new) versions of an application.

## Architecture
- **Nginx**: Acts as a reverse proxy/load balancer, directing traffic to the active environment.
- **Blue Service**: The currently running application version.
- **Green Service**: The new application version being deployed.

## How to Run
1. Start the services:
   ```bash
   docker-compose up -d --build
   ```
2. Test the current endpoint (should return `{"version": "blue"}`):
   ```bash
   curl http://localhost:8080
   ```
3. Run the deployment script to switch traffic to green:
   ```bash
   bash switch_to_green.sh
   ```
4. Test the endpoint again (should return `{"version": "green"}`):
   ```bash
   curl http://localhost:8080
   ```

## Key Concepts

### Zero-Downtime Reload with Nginx
The command `nginx -s reload` achieves zero downtime during configuration changes. 
When Nginx receives the reload signal, the main process parses the new configuration and creates new worker processes based on it. The old worker processes are instructed to gracefully shut down (drain). They will stop accepting new connections but will continue to serve current requests until they are completed, ensuring no active connections are dropped.

### Blue-Green vs. Canary Deployment
- **Blue-Green Deployment**: Switches 100% of the traffic from the old version (blue) to the new version (green) at once. It provides a fast rollback by switching the router back if issues are found. It requires 2x the infrastructure capacity during the switch.
- **Canary Deployment**: Gradually shifts a small percentage of traffic (e.g., 5%, then 20%, then 100%) to the new version. It allows monitoring for errors or performance degradation on a smaller user subset before a full rollout. It minimizes blast radius but is more complex to orchestrate.

### Expand-Contract Database Migrations
When deploying backward-incompatible database schema changes in a Blue-Green architecture (where both versions might briefly run simultaneously or need rollback), the expand-contract pattern is used:
1. **Expand**: Add the new schema elements (e.g., new column) without modifying the old ones. Deploy code that writes to both but reads from the old.
2. **Migrate**: Backfill data from the old schema to the new schema.
3. **Transition**: Deploy code that reads and writes *only* to the new schema.
4. **Contract**: Remove the old schema elements.

## Interview Q&A

**Q: What is the main advantage of Blue-Green deployment?**
A: Instant rollback capability and near-zero downtime. If the new version has critical bugs, you can instantly switch traffic back to the old version since it's still running.

**Q: How do you handle database migrations in a Blue-Green setup?**
A: Database changes must be backward compatible so both Blue and Green can function simultaneously. We use patterns like the Expand-Contract pattern to decouple schema changes from application deployments.

**Q: Why not just restart Nginx instead of reloading it?**
A: Restarting Nginx drops all active connections instantly, causing downtime and failed requests for current users. Reloading gracefully drains old connections while new workers handle incoming traffic.
