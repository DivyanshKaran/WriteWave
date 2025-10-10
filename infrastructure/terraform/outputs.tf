# Terraform Outputs for WriteWave Infrastructure
# ==============================================

# EKS Cluster Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = module.eks.cluster_iam_role_name
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "cluster_name" {
  description = "The name/id of the EKS cluster"
  value       = module.eks.cluster_name
}

output "cluster_arn" {
  description = "The Amazon Resource Name (ARN) of the cluster"
  value       = module.eks.cluster_arn
}

output "cluster_version" {
  description = "The Kubernetes server version for the EKS cluster"
  value       = module.eks.cluster_version
}

output "cluster_platform_version" {
  description = "Platform version for the EKS cluster"
  value       = module.eks.cluster_platform_version
}

# Node Group Outputs
output "eks_managed_node_groups" {
  description = "Map of attribute maps for all EKS managed node groups created"
  value       = module.eks.eks_managed_node_groups
}

output "node_security_group_id" {
  description = "ID of the node shared security group"
  value       = module.eks.node_security_group_id
}

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC where the cluster is deployed"
  value       = module.vpc.vpc_id
}

output "vpc_arn" {
  description = "The ARN of the VPC"
  value       = module.vpc.vpc_arn
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "private_subnets" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnets
}

output "database_subnets" {
  description = "List of IDs of database subnets"
  value       = module.vpc.database_subnets
}

output "nat_public_ips" {
  description = "List of public Elastic IPs created for AWS NAT Gateway"
  value       = module.vpc.nat_public_ips
}

# RDS Outputs
output "rds_user_db_endpoint" {
  description = "RDS instance endpoint for user database"
  value       = module.rds_user_db.db_instance_endpoint
}

output "rds_user_db_port" {
  description = "RDS instance port for user database"
  value       = module.rds_user_db.db_instance_port
}

output "rds_user_db_arn" {
  description = "The ARN of the RDS instance for user database"
  value       = module.rds_user_db.db_instance_arn
}

output "rds_content_db_endpoint" {
  description = "RDS instance endpoint for content database"
  value       = module.rds_content_db.db_instance_endpoint
}

output "rds_content_db_port" {
  description = "RDS instance port for content database"
  value       = module.rds_content_db.db_instance_port
}

output "rds_content_db_arn" {
  description = "The ARN of the RDS instance for content database"
  value       = module.rds_content_db.db_instance_arn
}

output "rds_progress_db_endpoint" {
  description = "RDS instance endpoint for progress database"
  value       = module.rds_progress_db.db_instance_endpoint
}

output "rds_progress_db_port" {
  description = "RDS instance port for progress database"
  value       = module.rds_progress_db.db_instance_port
}

output "rds_progress_db_arn" {
  description = "The ARN of the RDS instance for progress database"
  value       = module.rds_progress_db.db_instance_arn
}

output "rds_community_db_endpoint" {
  description = "RDS instance endpoint for community database"
  value       = module.rds_community_db.db_instance_endpoint
}

output "rds_community_db_port" {
  description = "RDS instance port for community database"
  value       = module.rds_community_db.db_instance_port
}

output "rds_community_db_arn" {
  description = "The ARN of the RDS instance for community database"
  value       = module.rds_community_db.db_instance_arn
}

output "rds_analytics_db_endpoint" {
  description = "RDS instance endpoint for analytics database"
  value       = module.rds_analytics_db.db_instance_endpoint
}

output "rds_analytics_db_port" {
  description = "RDS instance port for analytics database"
  value       = module.rds_analytics_db.db_instance_port
}

output "rds_analytics_db_arn" {
  description = "The ARN of the RDS instance for analytics database"
  value       = module.rds_analytics_db.db_instance_arn
}

# Redis Outputs
output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.redis.configuration_endpoint_address
}

output "redis_port" {
  description = "Redis cluster port"
  value       = aws_elasticache_replication_group.redis.port
}

output "redis_arn" {
  description = "The ARN of the Redis replication group"
  value       = aws_elasticache_replication_group.redis.arn
}

# S3 Outputs
output "s3_terraform_state_bucket" {
  description = "S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.bucket
}

output "s3_terraform_state_bucket_arn" {
  description = "S3 bucket ARN for Terraform state"
  value       = aws_s3_bucket.terraform_state.arn
}

output "s3_application_logs_bucket" {
  description = "S3 bucket for application logs"
  value       = aws_s3_bucket.application_logs.bucket
}

output "s3_application_logs_bucket_arn" {
  description = "S3 bucket ARN for application logs"
  value       = aws_s3_bucket.application_logs.arn
}

# DynamoDB Outputs
output "dynamodb_terraform_locks_table" {
  description = "DynamoDB table for Terraform locks"
  value       = aws_dynamodb_table.terraform_locks.name
}

output "dynamodb_terraform_locks_table_arn" {
  description = "DynamoDB table ARN for Terraform locks"
  value       = aws_dynamodb_table.terraform_locks.arn
}

# Route53 Outputs
output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_zone_name_servers" {
  description = "Route53 hosted zone name servers"
  value       = aws_route53_zone.main.name_servers
}

# ACM Outputs
output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate.main.arn
}

output "acm_certificate_domain_name" {
  description = "ACM certificate domain name"
  value       = aws_acm_certificate.main.domain_name
}

# Security Group Outputs
output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

# DB Subnet Group Outputs
output "db_subnet_group_name" {
  description = "DB subnet group name"
  value       = aws_db_subnet_group.main.name
}

output "db_subnet_group_arn" {
  description = "DB subnet group ARN"
  value       = aws_db_subnet_group.main.arn
}

# ElastiCache Subnet Group Outputs
output "elasticache_subnet_group_name" {
  description = "ElastiCache subnet group name"
  value       = aws_elasticache_subnet_group.main.name
}

# EKS Add-ons Outputs
output "eks_addons" {
  description = "Map of attribute maps for all EKS addons created"
  value       = {
    vpc_cni = aws_eks_addon.vpc_cni
    coredns = aws_eks_addon.coredns
    kube_proxy = aws_eks_addon.kube_proxy
    ebs_csi_driver = aws_eks_addon.ebs_csi_driver
  }
}

# Environment-specific Outputs
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

# Connection Information
output "kubectl_config" {
  description = "kubectl config command"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "cluster_connection_info" {
  description = "Cluster connection information"
  value = {
    cluster_name = module.eks.cluster_name
    region       = var.aws_region
    endpoint     = module.eks.cluster_endpoint
    kubectl_cmd  = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
  }
}

# Database Connection Information
output "database_connection_info" {
  description = "Database connection information"
  value = {
    user_db = {
      endpoint = module.rds_user_db.db_instance_endpoint
      port     = module.rds_user_db.db_instance_port
      database = "writewave_users"
    }
    content_db = {
      endpoint = module.rds_content_db.db_instance_endpoint
      port     = module.rds_content_db.db_instance_port
      database = "writewave_content"
    }
    progress_db = {
      endpoint = module.rds_progress_db.db_instance_endpoint
      port     = module.rds_progress_db.db_instance_port
      database = "writewave_progress"
    }
    community_db = {
      endpoint = module.rds_community_db.db_instance_endpoint
      port     = module.rds_community_db.db_instance_port
      database = "writewave_community"
    }
    analytics_db = {
      endpoint = module.rds_analytics_db.db_instance_endpoint
      port     = module.rds_analytics_db.db_instance_port
      database = "writewave_analytics"
    }
  }
}

# Cache Connection Information
output "cache_connection_info" {
  description = "Cache connection information"
  value = {
    redis = {
      endpoint = aws_elasticache_replication_group.redis.configuration_endpoint_address
      port     = aws_elasticache_replication_group.redis.port
    }
  }
}

# Monitoring and Logging
output "monitoring_info" {
  description = "Monitoring and logging information"
  value = {
    s3_logs_bucket = aws_s3_bucket.application_logs.bucket
    cloudwatch_log_group = "/aws/eks/${module.eks.cluster_name}/cluster"
  }
}

# Cost Information
output "cost_optimization_info" {
  description = "Cost optimization information"
  value = {
    spot_instances_enabled = var.enable_spot_instances
    single_nat_gateway     = var.single_nat_gateway
    multi_az_enabled       = var.enable_multi_az
  }
}
