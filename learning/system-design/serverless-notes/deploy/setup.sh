#!/bin/bash
# Wait for LocalStack to be ready
echo "Waiting for LocalStack..."
sleep 5

# Create DynamoDB table
echo "Creating DynamoDB table..."
awslocal dynamodb create-table \
    --table-name Notes \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region us-east-1

# Package Lambda function
echo "Packaging Lambda..."
cd "$(dirname "$0")/../lambda" || exit
zip function.zip notes.py

# Create Lambda function
echo "Creating Lambda function..."
awslocal lambda create-function \
    --function-name notes-handler \
    --runtime python3.9 \
    --handler notes.lambda_handler \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --zip-file fileb://function.zip \
    --region us-east-1

# Create API Gateway
echo "Creating API Gateway..."
API_ID=$(awslocal apigateway create-rest-api --name 'NotesAPI' --region us-east-1 --output text --query 'id')
ROOT_ID=$(awslocal apigateway get-resources --rest-api-id "$API_ID" --region us-east-1 --output text --query 'items[0].id')

# Create /notes resource
RESOURCE_ID=$(awslocal apigateway create-resource --rest-api-id "$API_ID" --parent-id "$ROOT_ID" --path-part "notes" --region us-east-1 --output text --query 'id')

# Note: Detailed integration setup for API Gateway in CLI is extremely verbose. 
# In practice, Serverless Framework or SAM is typically used. 
echo "Setup complete! Created DynamoDB, Lambda, and API Gateway (base setup)."
