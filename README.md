# Production-Level Authentication System

A complete, production-ready authentication system built with Express.js, TypeScript, and PostgreSQL. Features email verification via OTP, secure password hashing, JWT authentication, and comprehensive security measures.

## Features

- ✅ **OTP Email Verification** - Two-factor authentication via email
- ✅ **Secure Password Hashing** - Using bcryptjs with salt rounds
- ✅ **JWT Authentication** - Token-based authentication
- ✅ **TypeScript** - Full type safety
- ✅ **PostgreSQL Database** - Reliable data persistence
- ✅ **Input Validation** - Using express-validator
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Security Headers** - Using Helmet
- ✅ **CORS Protection** - Configurable CORS policies
- ✅ **Professional Logging** - Using Winston
- ✅ **Error Handling** - Centralized error management
- ✅ **Graceful Shutdown** - Clean server shutdown

## Registration Flow

1. **Send OTP**: User provides fullname and email → OTP sent to email
2. **Verify OTP**: User enters OTP from email → Verification confirmed
3. **Complete Registration**: User provides fullname, email, password, confirmPassword → User created in database
4. **Login**: User can now login with email and password

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- SMTP email service (Gmail, SendGrid, etc.)

## Installation

1. **Clone or download the project**

2. **Install dependencies**

```bash
npm install
```

3. **Set up PostgreSQL database**

```bash
# Create database
createdb auth_db

# Or using psql
psql -U postgres
CREATE DATABASE auth_db;
```

4. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

OTP_EXPIRY_MINUTES=10
```

**For Gmail:**

- Enable 2-Factor Authentication
- Generate an App Password at: https://myaccount.google.com/apppasswords
- Use the App Password in `SMTP_PASS`

5. **Run database migrations**

```bash
npm run migrate
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### 1. Send OTP

**POST** `/api/auth/send-otp`

Send verification OTP to user's email.

**Request Body:**

```json
{
  "fullname": "John Doe",
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "email": "john@example.com",
    "expiryMinutes": 10
  }
}
```

### 2. Verify OTP

**POST** `/api/auth/verify-otp`

Verify the OTP sent to email.

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP verified successfully. You can now complete your registration.",
  "data": {
    "email": "john@example.com",
    "fullname": "John Doe",
    "verified": true
  }
}
```

### 3. Complete Registration

**POST** `/api/auth/complete-registration`

Complete registration after OTP verification.

**Request Body:**

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

**Response:**

```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "user": {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "is_verified": true,
      "created_at": "2024-02-07T10:30:00.000Z",
      "updated_at": "2024-02-07T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Login

**POST** `/api/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "is_verified": true,
      "created_at": "2024-02-07T10:30:00.000Z",
      "updated_at": "2024-02-07T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5. Get Profile (Protected)

**GET** `/api/auth/profile`

Get current user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "is_verified": true,
      "created_at": "2024-02-07T10:30:00.000Z",
      "updated_at": "2024-02-07T10:30:00.000Z"
    }
  }
}
```

## Testing with cURL

### Send OTP

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com"
  }'
```

### Verify OTP

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### Complete Registration

```bash
curl -X POST http://localhost:3000/api/auth/complete-registration \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
├── src/
│   ├── config/
│   │   ├── config.ts           # Environment configuration
│   │   └── logger.ts           # Winston logger setup
│   ├── controllers/
│   │   └── auth.controller.ts  # Authentication controllers
│   ├── database/
│   │   ├── db.ts              # Database connection pool
│   │   └── migrate.ts         # Database migrations
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── error.middleware.ts     # Error handling
│   │   └── validation.middleware.ts # Input validation
│   ├── models/
│   │   └── user.model.ts      # User types and interfaces
│   ├── routes/
│   │   └── auth.routes.ts     # Authentication routes
│   ├── services/
│   │   ├── auth.service.ts    # Authentication logic
│   │   ├── email.service.ts   # Email sending
│   │   └── otp.service.ts     # OTP management
│   ├── app.ts                 # Express app configuration
│   └── server.ts              # Server entry point
├── .env.example               # Example environment variables
├── .gitignore                # Git ignore file
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript configuration
```

## Security Features

1. **Password Security**
   - Bcrypt hashing with 12 salt rounds
   - Strong password validation
   - Password confirmation required

2. **JWT Tokens**
   - Secure token generation
   - Configurable expiration
   - Token verification middleware

3. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Configurable limits

4. **Input Validation**
   - Email format validation
   - Password strength requirements
   - SQL injection prevention

5. **Security Headers**
   - Helmet middleware
   - CORS configuration
   - XSS protection

6. **OTP Security**
   - 10-minute expiration
   - One-time use only
   - Automatic cleanup of expired OTPs

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### OTP Codes Table

```sql
CREATE TABLE otp_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common error status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `404` - Not Found
- `409` - Conflict (email already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Logging

Logs are stored in:

- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

Console logging is enabled in development mode.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use SSL/TLS certificates
5. Set up proper database backups
6. Configure reverse proxy (nginx)
7. Use process manager (PM2)
8. Enable application monitoring

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
