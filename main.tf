terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"   # Replace with your actual state bucket name
    key            = "iopic/spa/terraform.tfstate" # The path within the bucket to save the state file
    region         = "us-east-1"                   # The region where the state bucket lives
    encrypt        = true                          # Ensures the state is encrypted at rest
    dynamodb_table = "terraform-state-lock"        # DynamoDB table for state locking
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "The deployment environment (e.g., staging, production)"
}

variable "gcp_project_id" {
  type        = string
  description = "The Google Cloud Project ID for this environment"
}

variable "bucket_name" {
  type    = string
  default = "my-iopic-spa-bucket"
}

variable "domain_name" {
  type    = string
  default = "app.iopic.world" # Replace with your desired subdomain or domain
}

variable "hosted_zone_name" {
  type    = string
  default = "iopic.world"     # Replace with your existing Route53 Hosted Zone name
}

# Data source to fetch the Route53 Hosted Zone
data "aws_route53_zone" "main" {
  name         = var.hosted_zone_name
  private_zone = false
}

# Request an ACM Certificate
resource "aws_acm_certificate" "spa_cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Create DNS records for ACM Certificate Validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.spa_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Wait for ACM validation to complete before deploying CloudFront
resource "aws_acm_certificate_validation" "spa_cert_validation" {
  certificate_arn         = aws_acm_certificate.spa_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# 1. Create the S3 Bucket
resource "aws_s3_bucket" "spa_bucket" {
  bucket = var.bucket_name

  tags = {
    Environment = var.environment
  }
}

# 2. Block all public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "spa_bucket_bpa" {
  bucket                  = aws_s3_bucket.spa_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 3. Create the Origin Access Control (OAC) for CloudFront
resource "aws_cloudfront_origin_access_control" "spa_oac" {
  name                              = "${var.bucket_name}-oac"
  description                       = "OAC for the SPA bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 4. Create the Viewer Request Function (Compression Routing)
resource "aws_cloudfront_function" "viewer_request" {
  name    = "${var.bucket_name}-viewer-request"
  runtime = "cloudfront-js-1.0"
  comment = "Rewrite URI to pre-compressed assets based on Accept-Encoding"
  publish = true
  code    = <<-EOT
    function handler(event) {
        var request = event.request;
        var uri = request.uri;
        var headers = request.headers;

        var isCompressibleAsset = uri.endsWith('.js') || uri.endsWith('.css') || uri.endsWith('.svg');

        if (isCompressibleAsset) {
            var acceptEncoding = headers['accept-encoding'] ? headers['accept-encoding'].value : '';

            if (acceptEncoding.includes('br')) {
                request.uri = uri + '.br';
            } else if (acceptEncoding.includes('gzip')) {
                request.uri = uri + '.gz';
            }
        }
        return request;
    }
  EOT
}

# 5. Create the Viewer Response Function (Fix Headers)
resource "aws_cloudfront_function" "viewer_response" {
  name    = "${var.bucket_name}-viewer-response"
  runtime = "cloudfront-js-1.0"
  comment = "Fix Content-Type and Content-Encoding for pre-compressed assets"
  publish = true
  code    = <<-EOT
    function handler(event) {
        var response = event.response;
        var request = event.request;
        var uri = request.uri;

        if (uri.endsWith('.js.gz') || uri.endsWith('.js.br')) {
            response.headers['content-type'] = { value: 'application/javascript; charset=utf-8' };
        } else if (uri.endsWith('.css.gz') || uri.endsWith('.css.br')) {
            response.headers['content-type'] = { value: 'text/css; charset=utf-8' };
        } else if (uri.endsWith('.svg.gz') || uri.endsWith('.svg.br')) {
            response.headers['content-type'] = { value: 'image/svg+xml; charset=utf-8' };
        }

        if (uri.endsWith('.br')) {
            response.headers['content-encoding'] = { value: 'br' };
        } else if (uri.endsWith('.gz')) {
            response.headers['content-encoding'] = { value: 'gzip' };
        }
        return response;
    }
  EOT
}

# 6. Create the CloudFront Distribution
resource "aws_cloudfront_distribution" "spa_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name]

  origin {
    domain_name              = aws_s3_bucket.spa_bucket.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.spa_bucket.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.spa_oac.id
  }

  default_cache_behavior {
    target_origin_id       = "S3-${aws_s3_bucket.spa_bucket.id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    
    # AWS Managed CachingOptimized Policy ID
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" 

    # Attach the CloudFront Functions
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.viewer_request.arn
    }

    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.viewer_response.arn
    }
  }

  # Catch 404s (Not Found) and return index.html for Vue Router
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  # Catch 403s (Forbidden) from S3 and return index.html for Vue Router
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.spa_cert_validation.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# 7. Create a Route53 Alias Record mapping the custom domain to CloudFront
resource "aws_route53_record" "spa_alias" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.spa_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.spa_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# 8. Attach the Bucket Policy to allow CloudFront to access the objects
resource "aws_s3_bucket_policy" "spa_bucket_policy_attachment" {
  bucket = aws_s3_bucket.spa_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.spa_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.spa_distribution.arn
          }
        }
      }
    ]
  })
}