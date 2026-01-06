import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { leaderboardRouter } from './routes/leaderboard';
import { rateLimitMiddleware } from './middleware/rateLimit';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(rateLimitMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/leaderboard', leaderboardRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
