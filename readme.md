# 🎬 Stellar Seat Booking System

A full-stack cinema seat booking application with complete authentication system including JWT tokens, email verification, and password reset functionality.

## ✨ Features

### Authentication System
- ✅ User Registration with Email Verification
- ✅ Login with JWT Access Token
- ✅ HTTP-Only Refresh Token (Cookie-based)
- ✅ Password Reset via Email
- ✅ Protected Routes Middleware
- ✅ Logout Functionality

### Seat Booking
- ✅ Visual Seat Layout (8 seats per row)
- ✅ Real-time Seat Availability
- ✅ Transaction-based Booking (Prevents double booking)
- ✅ Authenticated Users Only
- ✅ Booking History with User Tracking

### Security
- ✅ Password Hashing with Salt (SHA256)
- ✅ HTTP-Only Cookies for Tokens
- ✅ SQL Injection Prevention (Parameterized Queries)
- ✅ Input Validation (Zod Schemas)
- ✅ Row-level Locking for Seat Booking
- ✅ CORS with Credentials Support

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Brevo SMTP
- **Validation**: Zod

### Frontend
- **HTML/CSS**: Tailwind CSS
- **JavaScript**: Vanilla JS (Fetch API)

## 📁 Project Structure
book-my-ticket/
├── src/
│ ├── app/
│ │ ├── db/
│ │ │ ├── index.js # Drizzle instance
│ │ │ ├── pool.js # Shared DB connection pool
│ │ │ └── schema.js # Drizzle schemas
│ │ └── modules/
│ │ └── auth/
│ │ ├── controller/
│ │ │ └── auth.controller.js
│ │ ├── dto/
│ │ │ └── auth.dto.js
│ │ ├── middleware/
│ │ │ └── auth.middleware.js
│ │ ├── routes/
│ │ │ └── auth.routes.js
│ │ └── services/
│ │ └── auth.service.js
│ └── utils/
│ ├── api-error.js
│ ├── email.utils.js
│ ├── password.utils.js
│ └── token.utils.js
├── index.html # Frontend UI
├── index.mjs # Main server
├── docker-compose.yml # PostgreSQL container
├── drizzle.config.js # Drizzle config
├── package.json
└── .env # Environment variables



## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose (or PostgreSQL installed locally)
- Brevo Account (for email sending)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd book-my-ticket

Install dependencies

npm install

Set up environment variables

Create a .env file in the root directory:

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/book_seats_db

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Brevo Email Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_email@example.com
BREVO_SMTP_PASSWORD=your_brevo_smtp_key
BREVO_FROM_NAME=Your App Name
BREVO_FROM_EMAIL=noreply@yourdomain.com

Create database tables

-- Users table
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(45) NOT NULL,
    email VARCHAR(322) NOT NULL UNIQUE,
    password VARCHAR(66) NOT NULL,
    salt VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verification_token TEXT,
    verification_token_expires TIMESTAMP,
    refresh_token VARCHAR(500),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Seats table
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    isbooked INT DEFAULT 0,
    booked_by_user_id VARCHAR(255)
);

-- Insert 20 seats
INSERT INTO seats (isbooked) SELECT 0 FROM generate_series(1, 20);

-- Create indexes
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_verification_token ON "user"(verification_token);

Run Drizzle migrations (if needed)

npx drizzle-kit generate
npx drizzle-kit migrate

Start the server
node index.mjs

Open your browser

http://localhost:8080

 API Endpoints
Authentication Routes (/auth)
Method	Endpoint	Description	Auth Required
POST	/sign-up	Register new user	❌
POST	/sign-in	Login user	❌
GET	/verify-email	Verify email with token	❌
POST	/resend-verification	Resend verification email	❌
POST	/forgot-password	Request password reset	❌
POST	/reset-password	Reset password with token	❌
GET	/me	Get current user profile	✅
POST	/logout	Logout user	✅
POST	/refresh-token	Refresh access token	❌


Seat Booking Routes
Method	Endpoint	Description	Auth Required
GET	/seats	Get all seats	❌
PUT	/:id/:name	Book a seat	✅


Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
This project is licensed under the MIT License.

👨‍💻 Author
Your Name - [Your GitHub]

🙏 Acknowledgments
ChaiCode Community

Tailwind CSS for beautiful styling

Brevo for email services

PostgreSQL for reliable database

🐛 Known Issues & Future Improvements
Current Limitations
Access token not automatically invalidated on logout (expires naturally in 15 min)

No admin panel for managing seats

No payment integration

Planned Features
Payment gateway integration

Admin dashboard

Booking history for users

Email notifications for booking confirmation

Multiple showtimes

Seat selection by category (VIP, Regular)

QR code tickets

📞 Support
For issues or questions, please open an issue on GitHub or contact the maintainers.

Built with ❤️ for ChaiCode Cinema