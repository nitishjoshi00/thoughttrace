const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const pool = require('../db');

const openaiClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});

router.post('/reconstruct/:problemId', async (req, res) => {
  const { problemId } = req.params;
  try {
    const problemResult = await pool.query(
      'SELECT * FROM problems WHERE id = $1',
      [problemId]
    );
    if (problemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    const problem = problemResult.rows[0];

    const thoughtsResult = await pool.query(
      'SELECT raw_thought FROM thoughts WHERE problem_id = $1 ORDER BY created_at ASC',
      [problemId]
    );
    const thoughtTexts = thoughtsResult.rows.map((row) => row.raw_thought || '').filter(Boolean);

   const prompt = `You are a thoughtful DSA mentor helping a student understand their own reasoning. You are reflective, not preachy, and you never solve the problem for them.

Problem: ${problem.title} (${problem.difficulty}, ${problem.topic})

The student's thoughts, in the order they had them:
${thoughtTexts.join('\n')}

Reconstruct their reasoning as a clear narrative, then add brief reflection. Use these sections:

**How your thinking flowed**
Retrace their reasoning as a connected story — how one thought led to the next, what trade-offs they weighed, and what approach they landed on. Base this strictly on what they actually wrote; do not add steps they did not mention.

**Strengths**
Name the genuinely good instincts in their reasoning, specifically. If they reasoned well, say so plainly.

**Sharpen this**
Gently surface anything missing, unstated, or worth pressure-testing — phrased as a nudge ("you might also check...", "one edge case to consider..."), never as "you are wrong." If the reasoning was sound and complete, say that honestly instead of manufacturing a criticism.

Rules:
- Do NOT write the full code solution. The point is for them to understand their own thinking, not to be handed the answer.
- Keep it concise and conversational — a few short paragraphs, not an essay.
- If the thoughts are sparse or unclear, work with what's there and note what extra detail would help, rather than guessing.`;

    const completion = await openaiClient.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024
    });

    const reconstruction = (completion && completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) || '';

    await pool.query(
      'UPDATE problems SET reconstruction = $1 WHERE id = $2',
      [reconstruction, problemId]
    );

    res.status(200).json({ reconstruction });
  } catch (error) {
    console.error('Error reconstructing problem:', error);
    res.status(500).json({ error: 'Failed to reconstruct problem' });
  }
});

module.exports = router;