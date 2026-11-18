# LaundryFlow - AWS Cloud-Based Laundry Management System

This is the complete source code and infrastructure configuration for LaundryFlow.

## Architecture

- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL
- **Infrastructure:** Docker Compose (local), AWS (production)

## Getting Started Locally

1. Ensure you have Docker and Docker Compose installed.
2. Run `docker-compose up --build`
3. The frontend will be available at `http://localhost:5173`
4. The backend API docs will be available at `http://localhost:8000/docs`

## Packaging the Project

If you need to generate `LaundryFlow.zip` (for example, to submit the project), simply run the included Python script:

```bash
python3 package_project.py
```

This will safely archive the entire project structure into `LaundryFlow.zip`, excluding `node_modules`, `venv`, and `__pycache__`.

## AWS Deployment

Please refer to the `infrastructure/aws/` directory for setup scripts and configuration files for AWS EC2, S3, RDS, and Cognito deployment.
