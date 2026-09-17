output "website_endpoint" {
  description = "The endpoint of the S3 static website"
  value       = aws_s3_bucket_website_configuration.website_config.website_endpoint
}

output "bucket_name" {
  description = "The name of the created bucket"
  value       = aws_s3_bucket.website_bucket.id
}
