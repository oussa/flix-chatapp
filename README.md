# FLIX Help Center

A modern, accessible help center and customer support chat application for FLIX bus service. This application provides users with comprehensive help topics and real-time chat support.

![FLIX Help Center](https://cdn-cf.cms.flixbus.com/drupal-assets/2021-10/desktop-flix-hero-q4-2021.jpg)

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
- **Conversation Resolution**: Agents can mark conversations as resolved

### Agent Dashboard
- **Agent Authentication**: Agents can login to the dashboard using their email and password
- **Conversation Management**: Agents can view, reply and resolve conversations
- **Analytics**: Agents can view analytics of the conversations

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
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
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
└── types/                # TypeScript type definitions
```

## Key Accomplishments

1. **Database-Driven Help System**:
   - Implemented a database schema for help topics and content
   - Created a seeding mechanism for populating help topics
   - Built server actions for retrieving help topics and content

2. **Accessible UI Components**:
   - Enhanced accessibility of UI components with ARIA attributes
   - Implemented keyboard navigation for all interactive elements
   - Added proper focus management for modal dialogs

3. **Real-time Chat System**:
   - Implemented Socket.IO for real-time communication
   - Built a persistent conversation history system
   - Ability to resolve conversations

4. **Responsive Design**:
   - Designed a fully responsive interface that works on all devices
   - Implemented a mobile-first approach for all components
   - Used Tailwind CSS for consistent styling

5. **Search Functionality**:
   - Added search capability for help topics
   - Implemented real-time filtering of help topics based on search query

## What I would do differently next time

   - I would directly start a conversation with the user and not ask for their email, name and booking ID first on the client side before generating a conversation ID. This complicated the code.

   - I would start with socket.io then the DB persistence then the proper ui for the customer and agent chat components.

## Quick Wins

  - Sending emails to the user once a conversation is resolved.
  - Adding a knowledge base to the help center to answer common questions.\
  - Refactoring code to have more reusable components and avoid long components.
  - Adding more tests.
  - Improving Error Handling

## Other Potential Improvements

0. **e2e tests**:
   - Add e2e tests for the help center and chat.
   - Add unit tests for the server actions.
   - Add unit tests for the client components.
   - Add e2e tests for the chat.

1. **Admin Interface**:
   - Create an admin dashboard for managing help topics and content
   - Add analytics for tracking most viewed help topics
   - Implement user management for support agents

2. **Enhanced Search**:
   - Implement full-text search for help content
   - Add search suggestions and autocomplete
   - Include search analytics to improve content based on user queries

3. **Content Management**:
   - Add a WYSIWYG editor for help content
   - Implement content versioning to track changes
   - Add support for multimedia content (videos, interactive guides)

4. **User Accounts**:
   - Allow users to create accounts to track their support history
   - Implement personalized help recommendations
   - Add the ability for users to save favorite help topics

5. **Chatbot Integration**:
   - Implement an AI chatbot for handling common questions
   - Create a hybrid system that escalates to human agents when needed
   - Add sentiment analysis to prioritize urgent customer issues

6. **Internationalization**:
   - Add support for multiple languages
   - Implement region-specific help content
   - Create a language switcher component

7. **Performance Optimization**:
   - Implement server-side caching for help content
   - Add image optimization for faster loading
   - Implement code splitting for improved initial load time

8. **Feedback System**:
   - Add a rating system for help topics
   - Implement a feedback form for each help topic
   - Create a system for tracking and addressing user feedback

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Socket.IO](https://socket.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Lucide Icons](https://lucide.dev/)

