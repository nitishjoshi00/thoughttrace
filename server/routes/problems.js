const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM problems ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

router.post('/', async (req, res) => {
  const { title, difficulty, topic } = req.body;

  if (!title || !difficulty || !topic) {
    return res.status(400).json({ error: 'title, difficulty, and topic are required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO problems (title, difficulty, topic) VALUES ($1, $2, $3) RETURNING *',
      [title, difficulty, topic]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

module.exports = router;