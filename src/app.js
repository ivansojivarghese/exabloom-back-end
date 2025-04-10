// src/app.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

// Routes
const conversationsRouter = require('./routes/conversations');
app.use('/conversations', conversationsRouter);

// Test route
app.get('/', (req, res) => {
  res.send('API is working! 🎉');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
