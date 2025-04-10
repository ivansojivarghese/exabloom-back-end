# 📦 Exabloom Backend Test

A high-performance backend system built using **Express.js** and **PostgreSQL**, capable of managing and querying large-scale contact and messaging data.

---

## 📌 Features

- 📇 100,000 fake contacts
- ✉️ 5 million randomly distributed messages
- 🗂️ Efficient schema design with indexing
- 🔍 Search by name, phone number, or message content
- 🔄 Pagination and performance-focused query design

---

## 🛠️ System Requirements

- Node.js v18 or above
- PostgreSQL v13 or above
- npm (comes with Node)
- Git (for cloning repo)
- ~8GB RAM recommended (for bulk inserts and large dataset)
- Internet (to download dependencies and message CSV)

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/exabloom-backend.git
cd exabloom-backend

npm install
```

### 2. Configure the database

```bash
CREATE DATABASE exabloom;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

psql -U postgres -d exabloom -f db/schema.sql
```

### 3. Set environment variables

Create a file named .env

```bash
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/exabloom
```

### 4. Get the database and generate data

Download the csv. Generate the fake data.

```bash
node db/seed.js

```

Run the Express server
```bash
node src/app.js
```
Go to: http://localhost:3000



### 📡 API Endpoints
🔸 GET /conversations
Get 50 most recent conversations (latest message per contact).

Query params:
- page (optional): Page number

### 🔍 GET /conversations/search
Search by message content, contact name, or phone number.

Query params:
- searchValue (required)
- page (optional)

Example:
```bash
GET /conversations/search?searchValue=hello&page=2
```

### Performance Optimizations
- GIN indexes + pg_trgm on searchable columns for fast fuzzy text search
- Compound index on (contact_id, timestamp) for efficient retrieval of latest messages
- DISTINCT ON instead of lateral joins to speed up recent conversation queries
- Batch insertions during data generation to avoid memory overload

### Assumptions Made
Every contact has at least one message

Message content is sourced from the provided CSV

Phone numbers are unique and trimmed to 20 characters max

Search is case-insensitive and matches partial strings using ILIKE

Pagination is limited to 50 items per page for performance

No auth or frontend — this is a backend-only demo
