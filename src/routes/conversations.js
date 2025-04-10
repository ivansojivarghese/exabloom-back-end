// src/routes/conversations.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  try {
    /*
    const query = `
      SELECT c.id AS contact_id, c.name, c.phone_number,
             m.content, m.timestamp
      FROM contacts c
      JOIN LATERAL (
        SELECT content, timestamp
        FROM messages
        WHERE messages.contact_id = c.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) m ON true
      ORDER BY m.timestamp DESC
      LIMIT $1 OFFSET $2;
    `;*/

    const query = `
      SELECT DISTINCT ON (m.contact_id)
            c.id AS contact_id,
            c.name,
            c.phone_number,
            m.content,
            m.timestamp
        FROM messages m
        JOIN contacts c ON c.id = m.contact_id
        ORDER BY m.contact_id, m.timestamp DESC
        LIMIT $1 OFFSET $2;
    `;

    const { rows } = await pool.query(query, [limit, offset]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Search conversations by keyword
router.get('/search', async (req, res) => {
    const searchValue = req.query.searchValue || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
  
    try {
        
      const query = `
        SELECT DISTINCT ON (c.id)
               c.id AS contact_id,
               c.name,
               c.phone_number,
               m.content,
               m.timestamp
        FROM contacts c
        JOIN messages m ON m.contact_id = c.id
        WHERE
          m.content ILIKE $1 OR
          c.name ILIKE $1 OR
          c.phone_number ILIKE $1
        ORDER BY c.id, m.timestamp DESC
        LIMIT $2 OFFSET $3;
      `;
      /*
      const query = `
            SELECT DISTINCT ON (c.id)
                c.id AS contact_id,
                c.name,
                c.phone_number,
                m.content,
                m.timestamp
            FROM contacts c
            JOIN messages m ON m.contact_id = c.id
            WHERE
            m.content ILIKE '%searchText%' OR
            c.name ILIKE '%searchText%' OR
            c.phone_number ILIKE '%searchText%'
            ORDER BY c.id, m.timestamp DESC
            LIMIT 50 OFFSET 0;
      `;*/
  
      const values = [`%${searchValue}%`, limit, offset];
      const { rows } = await pool.query(query, values);
      res.json(rows);
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });
  

module.exports = router;
