const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const totalProblemsResult = await pool.query('SELECT COUNT(*) FROM problems');
    const totalThoughtsResult = await pool.query('SELECT COUNT(*) FROM thoughts');
    const byDifficultyResult = await pool.query(
      'SELECT difficulty, COUNT(*) AS count FROM problems GROUP BY difficulty'
    );

    res.status(200).json({
      totalProblems: parseInt(totalProblemsResult.rows[0].count, 10),
      totalThoughts: parseInt(totalThoughtsResult.rows[0].count, 10),
      byDifficulty: byDifficultyResult.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;