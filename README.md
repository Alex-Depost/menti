# Full-Stack Application with Docker Compose

This repository contains a full-stack application with a FastAPI backend and a Next.js frontend, both running behind an Nginx reverse proxy.

## Architecture

- **Frontend**: Next.js application
- **Backend**: FastAPI application
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL
- **Database Management**: pgAdmin
- **Monitoring**: Grafana

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone this repository
2. Run the following command to start all services:

```bash
docker-compose up -d
```

3. Access the application at http://localhost

## Service URLs

- **Application**: http://localhost
- **API**: http://localhost/api
- **pgAdmin**: http://localhost:5050
- **Grafana**: http://localhost:3002

## Development

To make changes to the code:

1. The source code for the frontend is in the `asd` directory
2. The source code for the backend is in the `back` directory
3. Changes will be automatically reflected due to volume mounts

## Stopping the Services

To stop all services:

```bash
docker-compose down
```

To stop all services and remove volumes:

```bash
docker-compose down -v
