# Helpdesk Ticket Management

A simple helpdesk application built using a microservices architecture.

Users can create support tickets and add comments. Admins can view all tickets, assign tickets, and update their status.

## Tech Stack

- **Frontend:** React.js, TypeScript
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Validation:** Zod
- **Observability:** OpenTelemetry, Jaeger, Prometheus
- **Infrastructure:** Docker Compose

## Architecture

The application consists of three backend services and a React frontend.

```text
React Frontend
      |
      v
  API Gateway
      |
      +----------+
      |          |
      v          v
 Auth Service  Ticket Service
      |          |
      v          v
 MongoDB      MongoDB
```

### Services

- **API Gateway:** Receives frontend requests and forwards them to the appropriate service.
- **Auth Service:** Handles user registration, login, authentication, and user roles.
- **Ticket Service:** Handles ticket creation, ticket retrieval, comments, assignment, and status updates.
- **Frontend:** Provides the user interface for users and admins.

## Service Communication

- The frontend sends API requests through the API Gateway.
- The API Gateway communicates with the Auth Service and Ticket Service.
- The Auth Service generates JWT tokens using an RSA private key.
- The Ticket Service verifies JWT tokens using the public key.
- The Ticket Service communicates with the Auth Service for internal user information using a shared service key.

## Database Design

The application uses two MongoDB databases.

**Auth Database (`helpdesk_auth`)**

Stores user information:
- Name
- Email
- Password hash
- Role (user/admin)

**Ticket Database (`ticketdb`)**

Stores ticket information:
- Title
- Description
- Status
- Priority
- Creator ID
- Assigned user ID
- Comments

Comments are stored inside their respective ticket documents.

## Run Locally

### Prerequisites

- Node.js
- npm
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/ViKi10000/helpdesk-microservice.git
cd helpdesk-microservice
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the application

```bash
npm run setup
```

This generates the required environment files, RSA keys, and shared service key. Save the generated admin credentials.

### 4. Start MongoDB and monitoring services

```bash
docker compose up -d
```

### 5. Create the admin account

```bash
npm run seed:admin --workspace=auth-service
```

### 6. Start the services

Open four separate terminals from the project root and run:

**Terminal 1 — API Gateway**

```bash
npm run dev --workspace=api-gateway
```

**Terminal 2 — Auth Service**

```bash
npm run dev --workspace=auth-service
```

**Terminal 3 — Ticket Service**

```bash
npm run dev --workspace=ticket-service
```

**Terminal 4 — Frontend**

```bash
npm run dev --workspace=frontend
```
## Admin Login

Use the following credentials to log in as admin:

- **Email:** admin@example.com
- **Password:** Admin@12345

### 7. Open the application

- Frontend: http://localhost:5173
- API Gateway: http://localhost:4000
- Jaeger: http://localhost:16686
- Prometheus: http://localhost:9090

## AI Tools Used

- **Claude:** Planning, architecture.
- **ChatGPT:** Code assistance, debugging, and development.
