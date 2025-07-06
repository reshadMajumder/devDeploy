# Security Dashboard

A Spring Boot application implementing JWT token-based authentication with role-based access control (USER and ADMIN roles).

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: USER and ADMIN roles with different permissions
- **Spring Security**: Comprehensive security configuration
- **H2 Database**: In-memory database for development
- **RESTful API**: Complete REST API for authentication and dashboard operations
- **Web Dashboard**: Modern web interface with Tailwind CSS
- **Java 17**: Built with the latest LTS version

## Technology Stack

- **Backend**: Spring Boot 3.2.0, Spring Security, Spring Data JPA
- **Database**: H2 (in-memory)
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: HTML, Tailwind CSS, JavaScript (Axios)
- **Build Tool**: Gradle
- **Java Version**: 17

## Project Structure

```
Security/
├── src/main/java/com/devdeploy/security/
│   ├── SecurityDashboardApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── ApplicationConfig.java
│   │   ├── JwtService.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── DataInitializer.java
│   ├── controller/
│   │   ├── AuthenticationController.java
│   │   ├── DashboardController.java
│   │   └── WebController.java
│   ├── dto/
│   │   ├── AuthenticationRequest.java
│   │   ├── AuthenticationResponse.java
│   │   └── RegisterRequest.java
│   ├── entity/
│   │   ├── User.java
│   │   └── Role.java
│   ├── repository/
│   │   └── UserRepository.java
│   └── service/
│       └── AuthenticationService.java
├── src/main/resources/
│   ├── application.yml
│   └── templates/
│       └── dashboard.html
├── build.gradle
├── settings.gradle
└── README.md
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Gradle (or use the Gradle wrapper)

### Running the Application

1. **Clone and navigate to the Security directory:**
   ```bash
   cd Security
   ```

2. **Build the project:**
   ```bash
   ./gradlew build
   ```

3. **Run the application:**
   ```bash
   ./gradlew bootRun
   ```

4. **Access the application:**
   - Web Dashboard: http://localhost:8081
   - H2 Console: http://localhost:8081/h2-console
   - API Base URL: http://localhost:8081/api/v1

### Default Credentials

The application automatically creates two users on startup:

- **Admin User:**
  - Username: `admin`
  - Password: `admin123`
  - Role: `ADMIN`

- **Regular User:**
  - Username: `user`
  - Password: `user123`
  - Role: `USER`

## API Endpoints

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/authenticate` - Login and get JWT token

### User Endpoints (Requires USER or ADMIN role)

- `GET /api/v1/user/profile` - Get user profile
- `GET /api/v1/user/dashboard` - Get user dashboard data

### Admin Endpoints (Requires ADMIN role)

- `GET /api/v1/admin/dashboard` - Get admin dashboard data
- `GET /api/v1/admin/users` - Get all users
- `DELETE /api/v1/admin/users/{userId}` - Delete a user

### Public Endpoints

- `GET /api/v1/health` - Health check
- `GET /` - Web dashboard
- `GET /dashboard` - Web dashboard
- `GET /login` - Web dashboard

## API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "email": "newuser@example.com",
    "firstName": "New",
    "lastName": "User",
    "role": "USER"
  }'
```

### Login
```bash
curl -X POST http://localhost:8081/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Access protected endpoint
```bash
curl -X GET http://localhost:8081/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

### JWT Token Structure
- **Algorithm**: HS256
- **Expiration**: 24 hours (configurable)
- **Claims**: Username, issued date, expiration date

### Role-Based Access Control
- **USER Role**: Can access user-specific endpoints
- **ADMIN Role**: Can access both user and admin endpoints

### Security Headers
- CSRF protection disabled (for API usage)
- Stateless session management
- JWT token validation on each request

## Configuration

### Application Properties (`application.yml`)

- **Server Port**: 8081
- **Database**: H2 in-memory
- **JWT Secret**: Base64 encoded secret key
- **JWT Expiration**: 86400000ms (24 hours)

### Customization

To customize the application:

1. **Change JWT Secret**: Update `jwt.secret` in `application.yml`
2. **Modify Token Expiration**: Update `jwt.expiration` in `application.yml`
3. **Add New Roles**: Extend the `Role` enum and update security configuration
4. **Database**: Change from H2 to PostgreSQL/MySQL by updating dependencies and configuration

## Development

### Adding New Endpoints

1. Create a new controller method
2. Add appropriate `@PreAuthorize` annotations for role-based access
3. Update security configuration if needed

### Adding New Roles

1. Add new role to the `Role` enum
2. Update security configuration in `SecurityConfig.java`
3. Add role-specific endpoints and logic

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `application.yml`
2. **JWT token expired**: Re-authenticate to get a new token
3. **Access denied**: Check user role and endpoint permissions

### Logs

Enable debug logging by setting:
```yaml
logging:
  level:
    org.springframework.security: DEBUG
    com.devdeploy.security: DEBUG
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational purposes and can be used as a reference for implementing JWT authentication with Spring Security. 

The application is **not running**—the health endpoint is not reachable (`Connection refused`).  
This means Spring Boot did not start successfully, or it crashed on startup.

### Next Steps

1. **Check the application logs/output for errors.**
   - If you started the app in the background, you may not see the error.
   - Let's run it in the foreground to see the error message.

2. **Run this command and watch for errors:**
   ```sh
   ./gradlew bootRun --no-daemon
   ```
   (Make sure you are in the `Security` directory.)

**If you see any error messages, please copy and paste them here.**  
This will help me diagnose and fix the problem for you! 