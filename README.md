# Cruces Gymnastics Web Application

A modern web application for Cruces Gymnastics school, built with Next.js and TypeScript. This application provides student enrollment, class management, and administrative features.

## Features

- **User Authentication**: Secure login and registration system
- **Student Enrollment**: Easy class enrollment and management
- **Admin Dashboard**: Administrative tools for managing users and enrollments
- **Class Management**: View and manage gymnastics classes
- **Attendance Tracking**: Track student attendance
- **Payment Processing**: Handle enrollment payments

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: SQLite (auth.db, enrollment.db)
- **Authentication**: Custom auth system
- **Deployment**: Ready for Vercel deployment

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the application

## Project Structure

- `/app` - Next.js app directory with pages and API routes
- `/lib` - Database and utility functions
- `/public` - Static assets
- `/scripts` - Helper scripts

## API Endpoints

- `/api/auth/*` - Authentication endpoints
- `/api/classes` - Class management
- `/api/enroll` - Enrollment functionality
- `/api/attendance` - Attendance tracking
- `/api/payments` - Payment processing
- `/api/admin/*` - Administrative endpoints

## Database

The application uses SQLite databases:
- `auth.db` - User authentication data
- `enrollment.db` - Class and enrollment data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary to Cruces Gymnastics.
