# Backend API Documentation

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server and database connection status.

### Authentication Routes

#### Register a new user
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username" (optional)
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username"
    },
    "token": "jwt_token"
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": "User already exists",
  "message": "An account with this email already exists"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username"
    },
    "token": "jwt_token"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Invalid email or password"
}
```

#### Database Status
```
GET /api/auth/status
```

Returns current database connection status.

## Database Connection

- MongoDB Atlas connection is configured
- Connection status is checked on each request
- Automatic retry on connection failure
- Graceful shutdown on application termination

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## Security Features

- Password hashing using bcryptjs
- JWT token authentication
- Email validation
- Password minimum length requirement
- MongoDB injection prevention through Mongoose

