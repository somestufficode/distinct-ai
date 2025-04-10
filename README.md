# Distinction - Construction Management Software

## Overview
Distinction is a modern construction management application designed to help construction companies manage projects, schedules, workers, and finances efficiently.

## Features
- User authentication and role-based access control
- Project management with detailed tracking
- Worker management with payment status tracking
- Schedule management with Google Maps integration for travel times
- Document management for project files
- Financial tracking for projects and labor costs

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- MongoDB with Mongoose
- Google Maps API for distance calculations

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/distinction.git
   cd distinction
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Setup environment variables
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your MongoDB URI and Google Maps API key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Structure
The application uses MongoDB with the following main collections:
- Users: Authentication and user information
- Projects: Construction project details
- Workers: Worker information with payment tracking

## API Routes
- `/api/projects`: Project management
- `/api/workers`: Worker management
- `/api/workers/[id]/toggle-payment`: Toggle worker payment status

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.