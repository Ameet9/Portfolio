# Terraform-in-a-Box: LocalStack S3 Static Website

## Overview
This project demonstrates how to use **Terraform** (Infrastructure as Code) to provision an AWS S3 bucket configured for static website hosting, entirely locally using **LocalStack**. This allows you to develop and test cloud infrastructure without incurring cloud costs or requiring real AWS credentials.

## Architecture
- **LocalStack**: Emulates AWS cloud services locally via Docker.
- **Terraform AWS Provider**: Configured to bypass real AWS authentication and route API calls to the LocalStack endpoint (`http://localhost:4566`).
- **AWS S3**: Provisioned via Terraform, with public access enabled and a bucket policy permitting `s3:GetObject` for website hosting.

## How to Run

1. **Start LocalStack:**
   ```powershell
   docker-compose up -d
   ```
   Wait a few moments for the LocalStack container to fully start.

2. **Initialize Terraform:**
   Downloads the AWS provider plugin and initializes the working directory.
   ```powershell
   terraform init
   ```

3. **Review the Execution Plan:**
   Shows what Terraform will create without actually making changes.
   ```powershell
   terraform plan
   ```

4. **Apply the Configuration:**
   Provisions the S3 bucket and policies in LocalStack.
   ```powershell
   terraform apply -auto-approve
   ```

5. **Upload the Website Files:**
   Use the AWS CLI to sync the local `website/` directory to the newly created S3 bucket on LocalStack.
   ```powershell
   aws --endpoint-url=http://localhost:4566 s3 sync website/ s3://my-local-website-bucket
   ```

6. **View the Site:**
   Open a browser and navigate to the endpoint output by Terraform, typically:
   `http://my-local-website-bucket.s3-website.us-east-1.localhost.localstack.cloud:4566/`
   *(Alternatively, `http://localhost:4566/my-local-website-bucket/index.html` depending on your local network setup and LocalStack version.)*

7. **Teardown (Clean up):**
   ```powershell
   terraform destroy -auto-approve
   docker-compose down
   ```

## Key Concepts

- **Infrastructure as Code (IaC):** The practice of managing and provisioning computing data centers through machine-readable definition files, rather than physical hardware configuration or interactive configuration tools.
- **State File (`terraform.tfstate`):** A JSON file where Terraform maps your real-world resources to your configuration, keeps track of metadata, and improves performance for large infrastructures.
- **Idempotency:** No matter how many times you run `terraform apply`, the end state of the infrastructure will be exactly what is declared in your configuration. It won't create duplicate buckets.
- **Configuration Drift:** When the real-world infrastructure changes outside of Terraform (e.g., someone manually edits an S3 policy in the console), it "drifts" from the defined `.tf` state. Running `terraform plan` will detect this drift and `terraform apply` will correct it.

## Interview Q&A

**Q1: What is Terraform and how does it differ from configuration management tools like Ansible?**
*Answer:* Terraform is primarily an infrastructure provisioning tool (IaC) that declares what cloud resources should exist. Ansible is primarily a configuration management tool used to configure the software and OS on existing machines. Terraform is declarative (what you want) and stateful, whereas Ansible is often procedural (how to do it) and state-agnostic.

**Q2: Why does Terraform need a state file?**
*Answer:* The state file (`terraform.tfstate`) is the source of truth mapping real-world cloud resources to the Terraform configuration. It helps Terraform determine what has changed, track resource dependencies, and improve performance by caching resource attributes instead of querying the cloud provider API for everything.

**Q3: How do you handle secrets in Terraform?**
*Answer:* Secrets should never be hardcoded in `.tf` files. They should be passed as variables (e.g., via `TF_VAR_` environment variables), retrieved dynamically using data sources (like AWS Secrets Manager or HashiCorp Vault), and marked as `sensitive = true` in the variables definition to prevent them from being printed in the CLI output. State files containing secrets should be stored in a remote, encrypted backend (like S3 with DynamoDB locking).

**Q4: What is configuration drift and how does Terraform resolve it?**
*Answer:* Configuration drift occurs when the actual state of the infrastructure deviates from the state defined in Terraform files (e.g., manual changes via the AWS Console). Running `terraform plan` compares the `.tf` files with the real infrastructure (via the state file). Running `terraform apply` will revert the manual changes, bringing the infrastructure back into alignment with the code.

**Q5: What are Terraform modules?**
*Answer:* Modules are self-contained packages of Terraform configurations that group related resources together. They promote reusability, organization, and DRY (Don't Repeat Yourself) principles. You can use standard modules from the Terraform Registry or create your own custom local/remote modules.
