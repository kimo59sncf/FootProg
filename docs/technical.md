
# Technical Documentation

## Application Architecture

### Frontend
- React application with TypeScript
- UI components using Radix UI and Tailwind CSS
- State management with React Query and custom hooks
- i18n support for English and French
- Protected routes and authentication
- Real-time chat functionality

### Backend
- Express.js server with TypeScript
- PostgreSQL database with Drizzle ORM
- Session-based authentication
- RESTful API endpoints
- WebSocket support for real-time features

### Database Schema
- Users: Authentication and profile data
- Matches: Sports match organization
- Participants: Match participation tracking
- Messages: Real-time chat system

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/logout - User logout
- GET /api/user - Get current user

### Matches
- GET /api/matches - List matches
- POST /api/matches - Create match
- GET /api/matches/:id - Get match details
- PUT /api/matches/:id - Update match
- DELETE /api/matches/:id - Delete match

### Participants
- POST /api/matches/:id/join - Join match
- DELETE /api/matches/:id/leave - Leave match

### Messages
- GET /api/matches/:id/messages - Get match messages
- POST /api/matches/:id/messages - Send message

## Deployment
- Production build with Vite
- Static assets optimization
- Environment-based configuration
- Session management with PostgreSQL store
