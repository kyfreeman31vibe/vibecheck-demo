# VibeCheck - Music Dating App System Architecture

## Overview

VibeCheck is a full-stack music-themed dating application built with React + TypeScript frontend and Express.js backend. The app matches users based on their music preferences (genres, artists, songs) and allows them to chat with compatible matches. It features a modern mobile-first design using shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Mobile-First**: Designed for mobile devices with responsive breakpoints

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Data Storage**: In-memory storage (MemStorage class) with planned PostgreSQL integration
- **Session Management**: Express sessions with PostgreSQL session store
- **Development**: Hot reload with Vite integration in development mode

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in shared/schema.ts with Zod validation
- **Tables**:
  - `users`: User profiles with music preferences (genres, artists, songs)
  - `matches`: User matching records with compatibility scores
  - `messages`: Chat messages between matched users
  - `swipes`: User swipe actions (left/right/super)

## Key Components

### User Management
- Registration and login system with username/password authentication
- Profile setup with music preference selection
- Music compatibility calculation algorithm

### Matching System
- Music-based compatibility scoring algorithm
- Swipe-based discovery interface (Tinder-like)
- Mutual matching system (both users must swipe right)

### Chat System
- Real-time messaging between matched users
- Message history persistence
- Support for different message types (text, song sharing)

### Music Integration
- Genre, artist, and song preference tracking
- Compatibility calculation based on shared musical interests
- Visual representation of music compatibility scores

## Data Flow

1. **User Registration**: User creates account → Profile setup with music preferences → Ready for discovery
2. **Discovery Flow**: User views potential matches → Swipes left/right → System checks for mutual interest → Creates match if mutual
3. **Matching**: Compatibility scores calculated based on shared music preferences → Users sorted by compatibility
4. **Chat Flow**: Matched users can send messages → Messages stored with metadata → Real-time chat interface

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client (Neon)
- **drizzle-orm & drizzle-kit**: TypeScript ORM and migration tools
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **express**: Node.js web framework

### UI Dependencies
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **@replit/vite-plugin-***: Replit-specific development plugins

## Deployment Strategy

### Development
- Vite dev server for frontend with hot module replacement
- Express server with TypeScript compilation via tsx
- Environment variables for database configuration
- Replit-specific development tooling integration

### Production Build
1. Frontend: Vite builds React app to `dist/public`
2. Backend: esbuild bundles Express server to `dist/index.js`
3. Single Node.js process serves both static files and API
4. PostgreSQL database connection via environment variables

### Database Management
- Drizzle migrations in `./migrations` directory
- Schema defined in shared TypeScript files
- Push-based schema updates for development
- PostgreSQL compatibility with Neon serverless database

### Scaling Considerations
- Stateless server design enables horizontal scaling
- Database connection pooling through Neon serverless
- Static asset serving can be offloaded to CDN
- Session storage in PostgreSQL for multi-instance support