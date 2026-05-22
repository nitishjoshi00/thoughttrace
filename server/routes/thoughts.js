const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/:id/thoughts', async (req, res) => {
  const { id } = req.params;
  const { raw_thought } = req.body;

  if (!raw_thought) {
    return res.status(400).json({ error: 'raw_thought is required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO thoughts (problem_id, raw_thought) VALUES ($1, $2) RETURNING *',
      [id, raw_thought]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating thought:', error);
    res.status(500).json({ error: 'Failed to create thought' });
  }
});

router.get('/:id/thoughts', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM thoughts WHERE problem_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching thoughts:', error);
    res.status(500).json({ error: 'Failed to fetch thoughts' });
  }
});

router.delete('/:id/thoughts/:thoughtId', async (req, res) => {
  const { thoughtId } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM thoughts WHERE id = $1',
      [thoughtId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Thought not found' });
    }
    res.status(200).json({ deleted: true });
  } catch (error) {
    console.error('Error deleting thought:', error);
    res.status(500).json({ error: 'Failed to delete thought' });
  }
});

module.exports = router;