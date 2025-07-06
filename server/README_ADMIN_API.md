# Admin API Endpoints

This document describes the admin-specific API endpoints for the Employee Data Management System.

## Base URL

All admin endpoints are prefixed with `/admin`

## Authentication

Most admin endpoints require an admin token in the Authorization header:

```
Authorization: Bearer <admin_token>
```

## Endpoints

### 1. Admin Login

**POST** `/admin/login`

Login as an admin user.

**Request Body:**

```json
{
  "sapId": "12345678",
  "password": "Admin@123"
}
```

**Response:**

```json
{
  "success": true,
  "msg": "Admin login successful",
  "token": "jwt_token_here",
  "user": {
    "sapId": "12345678",
    "email": "admin@nmdc.co.in",
    "isAdmin": true
  }
}
```

### 2. Get Employee Statistics

**GET** `/admin/get-employee-stats`

Get dashboard statistics including total employees, submitted applications, and pending applications.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalEmployees": 150,
    "submittedApplications": 120,
    "pendingApplications": 30
  },
  "msg": "Employee statistics retrieved successfully"
}
```

### 3. Get All Employees

**GET** `/admin/get-all-employees`

Get a list of all employees with their basic information and submission status.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "sapId": "12345678",
        "empId": "EMP001",
        "name": "John Doe",
        "department": "IT",
        "email": "john@company.com",
        "isSubmitted": true
      }
    ]
  },
  "msg": "All employees retrieved successfully"
}
```

### 4. Reset Individual Employee Password

**POST** `/admin/reset-employee-password`

Reset password for a specific employee.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "sapId": "12345678",
  "password": "NewPassword@123"
}
```

**Response:**

```json
{
  "success": true,
  "msg": "Password reset successfully for 12345678"
}
```

### 5. Reset All Employee Passwords

**POST** `/admin/reset-all-passwords`

Reset passwords for all employees to the same password.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "password": "NewPassword@123"
}
```

**Response:**

```json
{
  "success": true,
  "msg": "Passwords reset successfully for 150 employees",
  "modifiedCount": 150
}
```

### 6. View Employee Details

**GET** `/admin/view-employee/:sapId`

Get detailed information for a specific employee including all form data.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "personalDetails": [...],
    "address": [...],
    "education": [...],
    "family": [...],
    "experiences": [...]
  },
  "msg": "Employee data retrieved successfully"
}
```

### 7. Update Application Status

**PATCH** `/admin/update-application-status/:sapId`

Update the submission status of an employee's application.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "isSubmitted": true
}
```

**Response:**

```json
{
  "success": true,
  "msg": "Application status updated for 12345678",
  "data": {
    "sapId": "12345678",
    "isSubmitted": true
  }
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "msg": "Error message here",
  "statusCode": 400
}
```

Common HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not an admin user)
- `404` - Not Found (employee not found)
- `500` - Internal Server Error

## Setup Instructions

1. **Create Admin User:**

   ```bash
   npm run create-admin
   ```

   This creates a default admin user with:

   - SAP ID: `12345678`
   - Password: `Admin@123`
   - Email: `admin@nmdc.co.in`

2. **Start the Server:**

   ```bash
   npm run server
   ```

3. **Access Admin Dashboard:**
   - Navigate to `/admin/login` in the frontend
   - Use the admin credentials to log in
   - Access the dashboard at `/admin/dashboard`

## Security Notes

- Admin tokens expire after 24 hours
- All admin operations are logged
- Password reset operations are irreversible
- Admin access is restricted to users with `isAdmin: true` flag
