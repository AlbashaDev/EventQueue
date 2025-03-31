# Queue Management System

A modern web-based queue management platform designed to streamline recruitment events through innovative technology and user-friendly interfaces.

## Features

- React.js frontend with shadcn/ui components
- Authentication system with admin capabilities
- QR code generation and scanning
- Real-time updates with WebSockets
- PostgreSQL database with Drizzle ORM
- Responsive design for all devices

## Project Structure

The project is organized as a full-stack JavaScript application:

- `client/`: React frontend application
- `server/`: Express backend API
- `shared/`: Code shared between client and server (database schema, types)

## Deployment Guide

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- GitHub account (for version control)
- Vercel account (for frontend hosting)
- Render account (for backend hosting)

### Frontend Deployment (Vercel)

1. Create a GitHub repository and push your code
2. Log in to Vercel (https://vercel.com)
3. Create a new project and import your GitHub repository
4. Configure the build settings:
   - Framework preset: Vite
   - Build command: `cd client && npm run build`
   - Output directory: `client/dist`
5. Add environment variables:
   - `VITE_API_URL` = your backend URL (e.g., https://your-api.render.com)
6. Deploy!

### Backend Deployment (Render with Free Database)

1. Log in to Render (https://render.com)
2. Create a new Web Service
3. Connect to your GitHub repository
4. Configure the service:
   - Name: queue-management-backend
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
5. Add environment variables:
   - `DATABASE_URL` = your PostgreSQL connection string
   - `FRONTEND_URL` = your Vercel frontend URL
   - `NODE_ENV` = production
6. Create a Free PostgreSQL Database:
   - In Render dashboard, go to "Databases"
   - Create a new PostgreSQL database (Free tier)
   - Copy the "External Connection String" 
   - Use this as your DATABASE_URL environment variable

### Database Schema Migration

After deploying your backend:

1. Connect to your production database:
   ```
   npm run db:push
   ```
   
   This will automatically create all required tables in your production database.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Default Admin Login

- Username: admin
- Password: admin123