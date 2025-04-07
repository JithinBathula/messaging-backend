# Messaging Backend System

A high-performance Express.js and PostgreSQL backend system designed to efficiently manage and query a large-scale contact and messaging database. This system handles 100,000 contacts and 5 million messages with optimized queries for conversation retrieval and advanced search capabilities.

## System Requirements

- **Node.js**: v14.0.0 or higher
- **PostgreSQL**: v12.0 or higher
- **RAM**: Minimum 4GB (8GB+ recommended for optimal performance)
- **OS**: Any OS that supports Node.js and PostgreSQL (Linux/macOS/Windows)

## Detailed Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/JithinBathula/messaging-backend.git
cd messaging-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=messaging_db
PORT=3000
```

### 4. Set Up the Database

Create the PostgreSQL database:

```bash
psql -c "CREATE DATABASE messaging_db;" -U your_postgres_username
```

### 5. Run Database Migrations

```bash
npm run db:migrate
```

This will create the necessary tables with appropriate indexes.

### 6. Generate Test Data

```bash
npm run db:seed
```

⚠️ Warning: This will generate 100,000 contacts and 5 million messages, which may take considerable time (30+ minutes) depending on your system.

### 7. Create Materialized View for Performance

```bash
npm run db:view
```

This creates a materialized view that significantly improves query performance.

### 8. Start the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will be available at http://localhost:3000 (or the port specified in your .env file).

## Assumptions Made During Development

1. **Message Distribution**: The system assumes a realistic distribution of messages where approximately 20% of contacts generate 80% of messages (Pareto principle).

2. **Query Patterns**: The most common query pattern is retrieving recent conversations, followed by searching for specific content or contacts.

3. **Data Volume Growth**: The system is designed with the assumption that the database may grow beyond the initial 5 million messages over time.

4. **Read vs. Write Ratio**: The system is optimized for read-heavy operations, assuming that reading conversations occurs more frequently than writing new messages.

5. **Message Content**: Messages are assumed to be primarily text-based and of reasonable length (under 1MB per message).

## Key Design Decisions

### 1. Materialized View for Recent Conversations

The most critical performance optimization is the implementation of a materialized view for retrieving recent conversations. This approach:

- Pre-computes the complex query that identifies the most recent message for each contact
- Reduces query time from minutes to milliseconds
- Allows for efficient pagination and searching
- Creates a trade-off between query performance and data freshness that favors performance

### 2. Strategic Database Indexing

Multiple indexes were implemented to optimize different query patterns:

- Index on `messages.contact_id` for efficient joins
- Index on `messages.created_at` for chronological sorting
- Trigram index on `messages.content` for partial text matching
- Indexes on contact name and phone number for fast contact search

### 3. Modular Architecture

The codebase follows a clear separation of concerns:

- **Models**: Handle database interactions
- **Services**: Contain business logic
- **Routes**: Define API endpoints
- **Config**: Manage application configuration

This modular approach enhances maintainability and makes the system easier to extend.

### 4. Batch Processing for Data Seeding

Data generation utilizes batch processing to efficiently insert large volumes of data:

- Contacts are generated in batches of 1,000
- Messages are generated in batches of 10,000
- Temporary tables are used for bulk inserts

### 5. Realistic Data Distribution

The system generates data with a realistic distribution pattern:

- 20% of contacts have 80% of messages
- Message timestamps are distributed over the past year
- Message content is varied and based on real conversational samples

## API Endpoints

### Get Recent Conversations

```
GET /api/conversations
```

Parameters:

- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 50)
- `searchValue`: Optional text to search across name, phone number, and message content

### Get Messages for a Contact

```
GET /api/contacts/:contactId/messages
```

Parameters:

- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 50)

### Get Contact Details

```
GET /api/contacts/:contactId
```

### Get All Contacts

```
GET /api/contacts
```

Parameters:

- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 50)

## Performance Optimizations

1. **Materialized View**: Pre-computes the most expensive query
2. **Efficient Indexing**: Multiple indexes to support various query patterns
3. **Pagination**: Limits result sets to manageable sizes
4. **Text Search Optimization**: Trigram indexing for efficient partial text matching
5. **Batch Processing**: For efficient data loading and manipulation
