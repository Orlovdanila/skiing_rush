import { Router } from 'express';

export const leaderboardRouter = Router();

// Get leaderboard
leaderboardRouter.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    // TODO: Query database
    const leaderboard: unknown[] = [];

    return res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user stats
leaderboardRouter.get('/me', async (req, res) => {
  try {
    // TODO: Verify JWT token
    // TODO: Query user stats from database

    return res.json({
      rank: 0,
      score: 0,
      bestScore: 0,
      gamesPlayed: 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Submit score
leaderboardRouter.post('/submit', async (req, res) => {
  try {
    const { score, distance, checksum, sessionId, timestamp } = req.body;

    // Validate required fields
    if (!score || !distance || !checksum || !sessionId || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate timestamp (within 5 minutes)
    const now = Date.now();
    if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
      return res.status(400).json({ error: 'Invalid timestamp' });
    }

    // TODO: Verify checksum
    // TODO: Check for duplicate sessionId
    // TODO: Validate score/distance ratio
    // TODO: Save to database

    return res.json({
      success: true,
      newHighScore: false,
      rank: 0
    });
  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Failed to submit score' });
  }
});
