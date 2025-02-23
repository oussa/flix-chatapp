# Chat Support Application

A modern chat support application built with Next.js, TypeScript, and PostgreSQL. Features include a landing page with FAQ, a customer chat widget, and an agent dashboard.

## Features

- 🎯 Landing Page with FAQ articles
- 💬 Real-time chat widget
- 👥 Customer information collection
- 💾 Session persistence
- 📊 Agent dashboard
- 🔄 Responsive design

## Prerequisites

- Node.js 18 or later
- PostgreSQL 12 or later
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd chatapp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your database configuration:
```env
DATABASE_URL="postgres://username:password@localhost:5432/chatapp"
```

4. Set up the database:
```bash
# Create the database
createdb chatapp

# Generate migrations
npm run db:generate

# Push migrations to database
npm run db:push

# Run database setup script
npm run db:setup
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

- `/app` - Next.js pages and routing
- `/components` - React components
- `/drizzle` - Database schema and migrations
- `/lib` - Utility functions and database configuration
- `/scripts` - Setup and maintenance scripts

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push migrations to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:setup` - Run database setup script

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
