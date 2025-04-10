# Distinction - Construction Management Software

## Overview
Distinction is a modern construction management application designed to help construction companies manage projects, schedules, workers, and finances efficiently. Features an AI-powered assistant for contextual project support and team collaboration.

## Features
- User authentication and role-based access control
- Project management with detailed tracking
  - Project overview with budget and timeline tracking
  - Work items management for task breakdown
  - Worker assignment and scheduling
  - Document management for project files
  - Notes and updates tracking
- Schedule management
  - Calendar view with day layouts
  - Event scheduling and management
  - Work item scheduling
  - Google Maps integration for travel times
- Worker management
  - Worker profiles with specialties
  - Payment status tracking
  - Work history and assignments
  - Hourly rate management
- Document management
  - File upload and storage
  - Document categorization
  - Access control
- Financial tracking
  - Project budgets and expenses
  - Labor cost calculations
  - Payment tracking
- Real-time chat functionality
  - Draggable chat window
  - Project-specific discussions
  - Team communication
- AI-Powered Assistant
  - Project-aware contextual responses
  - Natural language project queries
  - Document and work item analysis
  - Task suggestions and reminders
  - Real-time project insights
- Enhanced Chat Interface
  - Customizable chat window
  - Draggable and resizable interface
  - Multi-screen position memory
  - Collapsible and expandable views
  - Project-specific chat contexts
  - AI-assisted responses
  - Document and image sharing
  - Chat history persistence

## Components
### Core Components
- `DashboardLayout`: Main application layout with navigation
- `Calendar`: Interactive calendar for scheduling
- `ChatModal`: Draggable and customizable chat interface with AI integration
  - Resizable window
  - Position memory
  - Context switching
  - AI response handling
  - File attachment support
- `NoteProcessor`: Notes and updates management
- `WorkItemCard`: Work item display and management
- `AIContextProvider`: Manages AI context and project-specific knowledge
- `ChatThread`: Handles chat history and message threading
- `AIResponseHandler`: Processes and formats AI responses

### Project Components
- `ProjectDetail`: Comprehensive project information display
- `ProjectList`: Overview of all projects
- `CreateProjectModal`: New project creation interface
- `EditProjectModal`: Project editing interface

### Work Management
- `WorkItems`: Task management interface
- `CreateWorkItemModal`: New work item creation
- `EditWorkItemModal`: Work item editing interface
- `ScheduleWorkItemModal`: Work item scheduling

### Worker Management
- `WorkerList`: Worker overview and management
- `WorkerDetail`: Individual worker information
- `AddWorkerModal`: New worker onboarding
- `WorkerAssignment`: Task assignment interface

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- MongoDB with Mongoose
- Google Maps API for distance calculations
- Headless UI for modals and dropdowns
- Hero Icons for UI elements
- OpenAI API for AI chat capabilities
- WebSocket for real-time chat
- LocalStorage for interface preferences
- Drag and Drop API for window management

## API Routes
### Projects
- `GET /api/projects`: List all projects
- `POST /api/projects`: Create new project
- `GET /api/projects/[id]`: Get project details
- `PUT /api/projects/[id]`: Update project
- `DELETE /api/projects/[id]`: Delete project

### Work Items
- `GET /api/work-items`: List work items
- `POST /api/work-items`: Create work item
- `GET /api/work-items/[id]`: Get work item details
- `PUT /api/work-items/[id]`: Update work item
- `DELETE /api/work-items/[id]`: Delete work item

### Workers
- `GET /api/workers`: List all workers
- `POST /api/workers`: Add new worker
- `GET /api/workers/[id]`: Get worker details
- `PUT /api/workers/[id]`: Update worker
- `DELETE /api/workers/[id]`: Remove worker
- `PUT /api/workers/[id]/toggle-payment`: Toggle payment status

### Events
- `GET /api/events`: List all events
- `POST /api/events`: Create new event
- `GET /api/events/[id]`: Get event details
- `PUT /api/events/[id]`: Update event
- `DELETE /api/events/[id]`: Delete event

### Chat and AI
- `POST /api/chat`: Send messages to AI assistant
- `GET /api/chat/history`: Retrieve chat history
- `POST /api/chat/context`: Update AI context
- `GET /api/chat/suggestions`: Get AI-powered suggestions

## Database Models
- `User`: User authentication and profile
- `Project`: Project details and management
- `Worker`: Worker information and tracking
- `WorkItem`: Task and work breakdown
- `Event`: Calendar events and scheduling
- `Document`: File storage and management

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

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.