# Architecture Overview

## Overview

This application is a Resume Parser and Analyzer built with a modern web stack. It allows users to upload resume documents (PDF, DOC, DOCX), parses the content, extracts structured information, and presents an analysis of the resume. The system uses a client-server architecture with a clear separation between frontend and backend components.

## System Architecture

The application follows a typical web application architecture with the following components:

1. **Frontend**: A React-based single-page application (SPA) using modern React patterns and libraries
2. **Backend**: An Express.js server that handles API requests, file processing, and business logic
3. **Database**: PostgreSQL database managed through Drizzle ORM
4. **API Layer**: RESTful API endpoints for communication between client and server

### Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │◄────►│  Express Server │◄────►│ PostgreSQL DB   │
│  (SPA)          │      │  (API Backend)  │      │                 │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                 ▲
                                 │
                                 ▼
                         ┌─────────────────┐
                         │                 │
                         │  Resume Parser  │
                         │  Logic          │
                         │                 │
                         └─────────────────┘
```

## Key Components

### Frontend Components

1. **UI Framework**: Uses a comprehensive UI component library built with Radix UI and styled with Tailwind CSS through the shadcn/ui approach
2. **State Management**: 
   - React Query for server state management
   - React's built-in state management for local UI state
3. **Routing**: Uses Wouter for lightweight client-side routing
4. **Key Pages/Components**:
   - Home page with file upload functionality
   - Resume details view with parsed information
   - Recent resumes list for browsing previous uploads

### Backend Components

1. **Server**: Express.js application handling HTTP requests
2. **API Routes**: RESTful endpoints for resume upload, retrieval, and management
3. **File Processing**: Logic to handle file uploads, extract text content
4. **Database Access**: Drizzle ORM for type-safe database operations

### Database Schema

The database schema is defined using Drizzle ORM and includes the following tables:

1. **users**: Stores user authentication information
   - id (PK)
   - username
   - password

2. **resumes**: Stores parsed resume data
   - id (PK)
   - summary (text)
   - education (text)
   - experience (text)
   - personalInformation (text)

## Data Flow

### Resume Upload Flow

1. User uploads a resume file through the frontend interface
2. The file is sent to the backend via a multipart form request
3. Server validates the file (type, size)
4. Text is extracted from the document (PDF, DOC, DOCX)
5. The extracted text is parsed to identify sections (summary, education, experience, etc.)
6. Structured data is stored in the database
7. The processed results are returned to the client
8. Frontend displays the parsed resume information

### Resume Viewing Flow

1. User selects a previously uploaded resume
2. Frontend requests resume data from the backend API
3. Server retrieves resume data from the database
4. Data is returned to the client
5. Frontend renders the resume information in a structured format

## External Dependencies

### Frontend Dependencies

1. **UI Components**: 
   - Radix UI primitives (@radix-ui/*)
   - shadcn/ui component patterns
   - Tailwind CSS for styling
2. **Data Fetching**: TanStack React Query
3. **Routing**: Wouter
4. **Form Handling**: React Hook Form with Zod validation
5. **Utilities**: 
   - clsx/cva for conditional CSS class composition
   - Lucide React for icons

### Backend Dependencies

1. **Database**: 
   - Drizzle ORM for database operations
   - Neon Serverless PostgreSQL client (@neondatabase/serverless)
2. **API Handling**:
   - Express.js for HTTP server
   - Multer for file upload handling
3. **Development Tooling**:
   - TypeScript for type safety
   - Vite for frontend bundling
   - esbuild for server bundling

## Deployment Strategy

The application is configured for deployment on Replit, with appropriate setup for both development and production environments:

1. **Development**: 
   - Uses Vite development server for hot module replacement
   - Backend runs with `tsx` for TypeScript execution without compilation
   - Environment variables for database connections
   - Debugging tools and error overlays

2. **Production**:
   - Frontend built with Vite
   - Backend bundled with esbuild
   - Static assets served from the `dist/public` directory
   - Environment variables for configuration

### Build Process

1. Frontend is built using Vite, producing optimized static assets
2. Backend is bundled using esbuild with external dependencies
3. Both are combined into a single deployable unit

### Deployment Configuration

The application includes configuration for Replit deployment with:
- Automatic build and start commands
- Port mapping (5000 internal to 80 external)
- Appropriate dependencies for the Node.js runtime

## Development Practices

1. **TypeScript**: Used throughout the codebase for type safety
2. **Module Aliases**: Configured for clean imports between components
3. **Environment Variables**: Used for configuration of database connections and other sensitive information
4. **Code Organization**: Clear separation between client, server, and shared code