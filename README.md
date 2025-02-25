# FLIX Help Center

A modern, accessible help center and customer support chat application for FLIX bus service. This application provides users with comprehensive help topics and real-time chat support.

![FLIX Help Center](https://cdn-cf.cms.flixbus.com/drupal-assets/2021-10/desktop-flix-hero-q4-2021.jpg)

## Demo

Help Center & Customer Chat: Available at: https://flix-chatapp.vercel.app

Agent Dashboard: Available at: https://flix-chatapp.vercel.app/agent (use `agent` as both username and password)

## Features

### Help Center
- **Comprehensive Help Topics**: Organized collection of help topics covering many aspects of FLIX services
- **Searchable Content**: Users can search through help topics to find relevant information
- **Responsive Design**: Fully responsive interface that works on mobile, tablet, and desktop devices
- **Accessibility**: WCAG-compliant components with proper ARIA attributes and keyboard navigation

### Customer Support Chat
- **Pre-collection of user information**: User is asked for their email, name and booking ID before starting a chat
- **Real-time Chat**: Live chat with customer support agents
- **Conversation History**: Persistent conversation history for returning users

### Agent Dashboard
- **Agent Authentication**: Agents can login to the dashboard using their email and password
- **Conversation Management**: Agents can view, reply and resolve conversations
- **Conversation Resolution**: Agents can mark conversations as resolved

### Misc
- **Continuous Deployment to Vercel on push to main** - https://flix-chatapp.vercel.app
- **Deployment of Socket.IO server** - https://flix-sio.oussama.io

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Socket.IO for real-time communication
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn UI components
- **Icons**: Lucide React icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oussa/flix-help-center.git
   cd flix-help-center
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy the `.env.example` file in the root directory and rename it to `.env` and set the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/flix_help
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Seed the database:
   ```bash
   npm run db:seed
   ```

6. Start the development server and the socketio server:
   ```bash
   npm run dev:all
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── actions/          # Server actions
│   ├── api/              # API routes
│   ├── help/             # Help pages
│   └── page.tsx          # Home page
├── components/           # React components
├── drizzle/              # Database schema and migrations
│   ├── migrations/       # Database migrations
│   ├── schema.ts         # Database schema
│   └── seed.ts           # Database seed script
├── lib/                  # Utility functions
├── public/               # Static assets
├── server/               # Socket.IO server
├── e2e/                  # End-to-end tests
└── types/                # TypeScript type definitions
```

## Limitations due to time constraints
   - No Agent Signup.
   - Error handling is not consistent across the application.
   - Input validation is super basic. (Example: Email is not validated properly)
   - On Help Topic page, "I need further help" button would prefill the topic and problem in the chat.
   - Email sending (with Resend API) of conversation summary when a conversation is resolved.
   - Test coverage should be around 80% at least.
   - Prettier and ESLint should be configured. (Used basic eslint config).
   - Dockerize the application.

## End-to-End Tests

The project includes end-to-end tests using Playwright to ensure the chat functionality works correctly across both customer and agent interfaces.

### Running Tests

To run the end-to-end tests:

1. Make sure your development server is running:
   ```bash
   npm run dev:all
   ```

2. In a separate terminal, run the Playwright tests:
   ```bash
   npm run e2e
   ```

3. To view the test report:
   ```bash
   npx playwright show-report
   ```

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Socket.IO](https://socket.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Lucide Icons](https://lucide.dev/)
