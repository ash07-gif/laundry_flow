# AWS CloudWatch Logging Setup

Monitoring is crucial for the LaundryFlow production environment. We use CloudWatch to aggregate logs from Nginx and the FastAPI application.

## 1. Install CloudWatch Agent on EC2

```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

## 2. Configure the Agent

Create the configuration file at `/opt/aws/amazon-cloudwatch-agent/bin/config.json`:

```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "LaundryFlow-Syslog",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "LaundryFlow-Nginx-Access",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "LaundryFlow-Nginx-Error",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

*Note: The FastAPI application logs standard output via systemd, which ends up in `/var/log/syslog`. We capture this stream above.*

## 3. Attach IAM Policy
Ensure the IAM Role attached to the EC2 instance includes the `CloudWatchAgentServerPolicy` managed policy.

## 4. Start the Agent
```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
```
