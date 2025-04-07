# Messaging Backend System - README

## Project Overview

This is a high-performance Express.js and PostgreSQL backend system designed to efficiently manage and query a large-scale contact and messaging database. The system handles 100,000 contacts and 5 million messages with optimized queries for conversation retrieval and search capabilities.

## Technical Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Key Libraries**: pg, dotenv, csv-parser

## System Architecture

The system follows a modular architecture with clear separation of concerns:

```
project/
├── config/            # Database configuration
├── db/                # Database migrations and seed scripts
├── models/            # Database models
├── routes/            # API routes
├── services/          # Business logic
├── utils/             # Utility functions
├── app.js             # Express application setup
└── server.js          # Server entry point
```

## Database Schema

The database consists of two primary tables:

### Contacts Table

```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Optimizations

### Database Indexes

- Index on `messages.contact_id` for faster joins
- Index on `messages.created_at` for efficient sorting
- Indexes on `contacts.name` and `contacts.phone_number` for search operations
- Trigram index on `messages.content` for full-text search

### Materialized View

A materialized view `latest_conversations` dramatically improves performance by pre-computing the most recent message for each contact, reducing query time from minutes to milliseconds.

```sql
CREATE MATERIALIZED VIEW latest_conversations AS
SELECT
  m.id,
  m.contact_id,
  m.content,
  m.created_at,
  c.name,
  c.phone_number
FROM messages m
JOIN contacts c ON c.id = m.contact_id
JOIN (
  SELECT contact_id, MAX(created_at) as latest_time
  FROM messages
  GROUP BY contact_id
) latest ON m.contact_id = latest.contact_id AND m.created_at = latest.latest_time
ORDER BY m.created_at DESC;
```

## API Endpoints

### Get Recent Conversations

```
GET /api/conversations
```

- Returns: 50 most recent conversations, ordered by timestamp
- Parameters:
  - `page`: Page number (default: 1)
  - `pageSize`: Number of conversations per page (default: 50)
  - `searchValue`: Optional search term to filter conversations

### Get Contact Messages

```
GET /api/contacts/:contactId/messages
```

- Returns: Messages for a specific contact
- Parameters:
  - `page`: Page number (default: 1)
  - `pageSize`: Number of messages per page (default: 50)

### Get Contact Details

```
GET /api/contacts/:contactId
```

- Returns: Details of a specific contact

### Get All Contacts

```
GET /api/contacts
```

- Returns: List of contacts with pagination
- Parameters:
  - `page`: Page number (default: 1)
  - `pageSize`: Number of contacts per page (default: 50)

## Setup Instructions

### Prerequisites

- Node.js v14+ and npm
- PostgreSQL 12+

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/messaging-backend.git
cd messaging-backend
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file with database credentials

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=messaging_db
PORT=3000
```

4. Run database migrations

```bash
npm run db:migrate
```

5. Generate dummy data

```bash
npm run db:seed
```

6. Create materialized view for performance

```bash
npm run db:view
```

7. Start the server

```bash
npm run dev
```

## Performance Considerations

- **Query Optimization**: Used PostgreSQL's DISTINCT ON and materialized views
- **Batch Processing**: Implemented batch processing for data seeding
- **Pagination**: Efficient pagination to handle large result sets
- **Indexing**: Strategic indexing to improve query performance

## Key Design Decisions

1. **Materialized View**: Implemented a materialized view for the most performance-critical query, dramatically reducing response time
2. **Modular Architecture**: Separated concerns into models, services, and controllers for better maintainability
3. **Comprehensive Indexing**: Added multiple indexes to support various query patterns
4. **Realistic Data Distribution**: Used Pareto distribution to create realistic message patterns
