const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security headers - protects against common attacks
app.use(helmet());

// Rate limiting - prevents API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requests per window
});
app.use(limiter);

app.use(cors());
app.use(express.json());

// Routes
const problemsRouter = require('./routes/problems');
const thoughtsRouter = require('./routes/thoughts');
const aiRouter = require('./routes/ai');
const statsRouter = require('./routes/stats');

app.use('/problems', problemsRouter);
app.use('/problems', thoughtsRouter);
app.use('/ai', aiRouter);
app.use('/stats', statsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ThoughtTrace API running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ThoughtTrace server running on port ${PORT}`);
});