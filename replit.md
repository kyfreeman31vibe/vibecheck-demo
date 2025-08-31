# VibeCheck - Music Dating App System Architecture

## Overview

VibeCheck is a full-stack music-themed dating application designed to connect users based on their musical compatibility. The platform allows users to discover, match, and chat with others who share similar tastes in genres, artists, and songs. It features a mobile-first design, real-time messaging, and integrates with external music event APIs to foster a vibrant community around shared musical interests. The ambition is to create a leading platform for music lovers seeking meaningful connections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Build**: Vite for development and production.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query for server state.
- **UI**: shadcn/ui components built on Radix UI, styled with Tailwind CSS for a mobile-first, responsive design and a "Sunset Theme" (yellow, orange, coral, pink, purple gradients, glassmorphism effects).

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API**: RESTful API design.
- **Database**: PostgreSQL with Drizzle ORM for schema management and data storage.
- **Session Management**: Express sessions with PostgreSQL store.
- **Core Features**:
    - **User Management**: Registration, login, profile setup with detailed music preferences, and an enhanced 7-step profile creation/editing process.
    - **Matching System**: Music-based compatibility scoring algorithm and a swipe-based discovery interface.
    - **Chat System**: Real-time messaging with message history.
    - **Music Integration**: Tracking and calculation of compatibility based on shared musical interests, including a comprehensive artist database (600+ artists across 24 genres).
    - **Profile Design**: Redesigned "how others see you" profile view with large photo display, music personality badges, and consolidated editing.
    - **Settings Page**: Comprehensive settings with Account, Notifications, Privacy, and mock Billing sections.
    - **Photo Upload System**: Robust photo upload, saving, and persistence.

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect.
- **Schema**: Defined with Zod validation.
- **Tables**: `users`, `matches`, `messages`, `swipes`, `eventAttendances`, `socialConnections`, `eventComments`.

### Deployment Strategy
- **Development**: Vite dev server (frontend), Express server with `tsx` (backend), environment variables.
- **Production**: Frontend built to `dist/public`, backend bundled with `esbuild` to `dist/index.js`. Single Node.js process serves both.
- **Database**: Drizzle migrations for PostgreSQL, compatible with Neon serverless database.
- **Scaling**: Stateless server design, database connection pooling, static asset offloading, PostgreSQL for session storage.

## External Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL client.
- **drizzle-orm & drizzle-kit**: TypeScript ORM and migration tools.
- **@tanstack/react-query**: Server state management.
- **wouter**: Lightweight React router.
- **express**: Node.js web framework.
- **@radix-ui/***: Headless UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Component variant management.
- **lucide-react**: Icon library.
- **tsx**: TypeScript execution.
- **esbuild**: JavaScript bundler.
- **Ticketmaster API**: For real-time concert data integration on the Events page.
- **Spotify OAuth**: For user music data integration and authentication.