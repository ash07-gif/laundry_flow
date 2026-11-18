#!/bin/bash
# EC2 Setup Script for LaundryFlow Backend

sudo apt-update -y
sudo apt-get upgrade -y
sudo apt-get install -y python3-pip python3-venv nginx git postgresql-client

mkdir -p /opt/laundryflow
cd /opt/laundryflow

# Create venv
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt

# Configure Nginx
sudo cp infrastructure/aws/nginx.conf /etc/nginx/sites-available/laundryflow
sudo ln -s /etc/nginx/sites-available/laundryflow /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# Setup Systemd Service
sudo cp infrastructure/aws/laundryflow.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable laundryflow
sudo systemctl start laundryflow
