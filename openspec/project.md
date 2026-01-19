# Project Context

## Purpose
This project implements a background task management system for OpenCode AI, allowing users to launch and manage asynchronous AI agent tasks that run independently of the main conversation flow.

## Tech Stack
- TypeScript - Primary programming language
- OpenCode Plugin Framework - For tool registration and client integration
- Zod - For type-safe schema validation
- PostgreSQL via Neon - Database for task persistence
- Clerk - Authentication system
- CloudConvert & Cloudinary - Media processing services

## Project Conventions

### Code Style
- TypeScript with strict type checking
- ES modules with import/export syntax
- Async/await for asynchronous operations
- Descriptive variable and function names

### Architecture Patterns
- Plugin-based architecture using OpenCode plugin framework
- Event-driven task lifecycle management
- Type-safe tool definitions with Zod schemas
- Client-server separation for scalability

### Testing Strategy
[Define testing approach when implemented]

### Git Workflow
[Define git workflow when established]

## Domain Context
This system enables users to offload complex AI tasks to background processes, allowing them to continue working while tasks execute asynchronously. Tasks can involve multiple tool calls, file operations, and external API interactions.

## Important Constraints
- Tasks must be traceable with parent session/message context
- Results have configurable retention periods
- Plugin must integrate cleanly with OpenCode ecosystem
- Type safety is critical for tool argument validation

## External Dependencies
- OpenCode AI Plugin Framework (@opencode-ai/plugin)
- PostgreSQL database (Neon)
- Clerk authentication
- CloudConvert API
- Cloudinary API
