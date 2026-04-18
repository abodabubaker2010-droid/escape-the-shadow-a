# Escape the Shadow - Platformer Game

## Overview

A browser-based 2D platformer game where players must escape a shadow that follows their movements with a 2-second delay. The game features multiple levels with platforms, buttons, doors, and light zones. Players navigate through levels, avoiding their shadow duplicate, and race to the exit. High scores are tracked based on completion time.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing (Home and Game pages)
- **State Management**: TanStack React Query for server state and data fetching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark gaming theme (CSS variables for colors)
- **Animations**: Framer Motion for page transitions and UI effects
- **Game Engine**: Custom HTML5 Canvas-based engine in `client/src/lib/game/`

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled with tsx
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Build**: esbuild for production bundling, Vite for development HMR

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema**: Defined in `shared/schema.ts` with two tables:
  - `levels`: Stores level metadata and JSON configuration (platforms, spawns, buttons, doors, light zones)
  - `scores`: High scores per level with player name and completion time
- **Migrations**: Drizzle Kit with `db:push` command

### Key Design Patterns
- **Shared Types**: Schema and route definitions in `shared/` directory are used by both client and server
- **Type-Safe API**: Zod schemas validate both request inputs and response outputs
- **Game Loop**: RequestAnimationFrame-based render loop with physics simulation
- **Shadow Mechanic**: Player positions stored in a buffer, shadow replays movements after configurable delay

### File Structure
```
client/src/
  ├── components/     # UI components (GameCanvas, shadcn/ui)
  ├── hooks/          # Custom hooks (use-levels, use-scores, use-mobile)
  ├── lib/game/       # Game engine (engine.ts, types.ts)
  ├── pages/          # Route pages (Home, Game, not-found)
server/
  ├── index.ts        # Express app setup
  ├── routes.ts       # API route handlers
  ├── storage.ts      # Database operations
  ├── db.ts           # Drizzle connection
shared/
  ├── schema.ts       # Drizzle table definitions
  ├── routes.ts       # API route contracts
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database (connection via DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database operations with `drizzle-orm` and `drizzle-zod`
- **Connection Pool**: `pg` package with connection pooling

### UI Libraries
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component
- **Vaul**: Drawer component
- **cmdk**: Command palette

### Build Tools
- **Vite**: Development server with HMR
- **esbuild**: Production bundling
- **PostCSS/Autoprefixer**: CSS processing

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator