# School Management System API

A production-ready REST API for managing school data, built with Go, Gin, and GORM.

## Features

- RESTful API endpoints for students, teachers, courses, and users
- PostgreSQL database integration with GORM
- JWT-based authentication and authorization
- Request validation and error handling
- Comprehensive logging system
- Dockerized application and database
- Kubernetes deployment configuration
- CI/CD with GitHub Actions

## Project Structure

```
school-management-api
├── api                  # API layer (controllers, routes, middleware)
│   ├── controllers      # HTTP request handlers
│   ├── middlewares      # HTTP middleware
│   └── routes           # Route definitions
├── config               # App configuration
├── docker               # Docker-related files
├── docs                 # API documentation
├── internal             # Internal packages
│   ├── models           # Database models
│   ├── repositories     # Data access layer
│   ├── services         # Business logic
│   └── utils            # Utility functions
├── k8s                  # Kubernetes manifests
├── migrations           # Database migrations
├── tests                # Integration and unit tests
├── .github/workflows    # GitHub Actions CI/CD pipelines
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Docker image definition
├── go.mod               # Go module file
├── main.go              # Application entry point
└── README.md            # Project documentation
```

## Getting Started

### Prerequisites

- Go 1.21 or later
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)
- Kubernetes cluster (for production deployment)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/school-management-api.git
   cd school-management-api
   ```

2. Set up environment variables (or create a .env file):
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the development environment with Docker:
   ```bash
   docker-compose up -d
   ```

4. Or build and run locally:
   ```bash
   go mod download
   go run main.go
   ```

The API will be available at http://localhost:8080.

### Running Tests

```bash
go test ./tests/...
```

## API Documentation

API documentation is available at `/swagger/index.html` when the application is running.

### Authentication

- `POST /api/v1/auth/login`: Authenticate a user and get a JWT token
- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/refresh`: Refresh JWT token
- `POST /api/v1/auth/logout`: Logout and invalidate token

### Students

- `GET /api/v1/students`: Get all students (with pagination and filtering)
- `GET /api/v1/students/:id`: Get a student by ID
- `POST /api/v1/students`: Create a new student
- `PUT /api/v1/students/:id`: Update a student
- `DELETE /api/v1/students/:id`: Delete a student
- `POST /api/v1/students/:id/courses`: Enroll a student in a course
- `DELETE /api/v1/students/:id/courses/:courseId`: Drop a student from a course
- `GET /api/v1/students/:id/courses`: Get all courses for a student
- `GET /api/v1/students/:id/grades`: Get all grades for a student

### Teachers

- `GET /api/v1/teachers`: Get all teachers (with pagination and filtering)
- `GET /api/v1/teachers/:id`: Get a teacher by ID
- `POST /api/v1/teachers`: Create a new teacher
- `PUT /api/v1/teachers/:id`: Update a teacher
- `DELETE /api/v1/teachers/:id`: Delete a teacher
- `POST /api/v1/teachers/:id/courses`: Assign a course to a teacher
- `DELETE /api/v1/teachers/:id/courses/:courseId`: Remove a course from a teacher
- `GET /api/v1/teachers/:id/courses`: Get all courses for a teacher

### Courses

- `GET /api/v1/courses`: Get all courses (with pagination and filtering)
- `GET /api/v1/courses/:id`: Get a course by ID
- `POST /api/v1/courses`: Create a new course
- `PUT /api/v1/courses/:id`: Update a course
- `DELETE /api/v1/courses/:id`: Delete a course
- `GET /api/v1/courses/:id/students`: Get all students for a course
- `GET /api/v1/courses/:id/teachers`: Get all teachers for a course
- `POST /api/v1/courses/:id/grades`: Add/update grades for students in a course
- `GET /api/v1/courses/:id/schedule`: Get course schedule

### Users

- `GET /api/v1/users`: Get all users (admin only)
- `GET /api/v1/users/:id`: Get a user by ID
- `POST /api/v1/users`: Create a new user (admin only)
- `PUT /api/v1/users/:id`: Update a user
- `DELETE /api/v1/users/:id`: Delete a user (admin only)
- `PUT /api/v1/users/:id/role`: Update user role (admin only)
- `PUT /api/v1/users/password`: Change user password

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t school-management-api .
docker run -p 8080:8080 --env-file .env school-management-api
```

### Kubernetes

Deploy to Kubernetes:

```bash
# Update the configuration in k8s/configmap.yaml
kubectl apply -f k8s/
```

### Environment Variables

The application uses the following environment variables:

- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: PostgreSQL database name
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRY`: JWT token expiry time (in hours)
- `PORT`: Application port (default: 8080)
- `ENV`: Environment name (development, staging, production)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## Monitoring and Maintenance

The API exposes metrics at `/metrics` for Prometheus integration and a health check endpoint at `/health`.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request