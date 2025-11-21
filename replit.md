# VibeCheck - Music Social Network System Architecture

## Overview

VibeCheck is a full-stack music-based social networking platform designed to connect users through their shared love of music. The platform allows users to build meaningful connections—whether friendships, event buddies, or romantic relationships—based on musical compatibility. Users can discover others with similar tastes, share their profiles via direct handles, send connection requests, attend music events together, and engage in real-time messaging. It features a mobile-first design, shareable profile links, and integrates with external music event APIs to foster a vibrant community around shared musical interests. The ambition is to create the leading social network for music lovers of all connection types.

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
    - **User Management**: Registration, login, profile setup with detailed music preferences, and an enhanced 7-step profile creation/editing process. During signup, users select their connection interests (friends, dating, or both) to personalize their experience.
    - **Connection Interests**: Users specify what they're looking for during registration—friends & connections, dating & romance, or both. This preference is stored in the database and can be used to personalize discovery and recommendations.
    - **Social Connections**: Direct connection requests with support for multiple connection types (friends, music buddies, event buddies) separate from romantic matching.
    - **Shareable Profiles**: Public profile pages accessible via username handles (e.g., /u/username) that can be shared with anyone.
    - **Matching System**: Optional music-based compatibility scoring algorithm and a swipe-based discovery interface for dating.
    - **Connection Management**: Dedicated connections page to view, accept, and manage friend requests and connections.
    - **Chat System**: Real-time messaging with message history.
    - **Music Integration**: Tracking and calculation of compatibility based on shared musical interests, including a comprehensive artist database (600+ artists across 24 genres).
    - **Profile Design**: Redesigned "how others see you" profile view with large photo display, music personality badges, shareable profile links, and consolidated editing.
    - **Settings Page**: Comprehensive settings with Account, Notifications, Privacy, and mock Billing sections.
    - **Photo Upload System**: Robust photo upload, saving, and persistence.
    - **Event Discovery**: Browse and RSVP to music events, see who else is attending.
    - **Spotify Music Sharing**: Users can share their Spotify playlists, top artists, and top tracks on their profiles. Other users can view and comment on these shared music items, fostering music-based conversations and connections.

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect.
- **Schema**: Defined with Zod validation.
- **Tables**: 
  - `users` - User accounts and profile data (includes `connectionInterests` field to store friend/dating preferences)
  - `matches` - Romantic matching/dating relationships  
  - `messages` - Chat messages between matches
  - `swipes` - Dating discovery swipe actions
  - `socialConnections` - Non-romantic connections (friends, music buddies, event buddies) with request/accept flow
  - `eventAttendances` - User RSVPs to music events
  - `eventComments` - User comments on events
  - `spotifyItems` - Shared Spotify playlists, top artists, and top tracks
  - `spotifyItemComments` - Comments on shared Spotify music items

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