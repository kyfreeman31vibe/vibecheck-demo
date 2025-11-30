# VibeCheck

A social connection application for music lovers. Connect with people who share your music taste!

## Features

- User authentication
- Music discovery
- Social features to connect with other music lovers
- Spotify integration
- Real-time chat

## Tech Stack

- Frontend: React, TypeScript, Vite, TailwindCSS
- Backend: Node.js, Express, PostgreSQL with Drizzle ORM
- Authentication: JWT, Passport.js
- Styling: TailwindCSS with Radix UI components

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see .env.example)
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=your_database_url
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema
