const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  firstName: string;
  score: number;
  createdAt: string;
}

export interface UserStats {
  rank: number;
  score: number;
  bestScore: number;
  gamesPlayed: number;
}

export async function getLeaderboard(limit = 100, offset = 0): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/leaderboard?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function getMyStats(token: string): Promise<UserStats> {
  const res = await fetch(`${API_BASE}/leaderboard/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function submitScore(
  token: string,
  data: { score: number; distance: number; checksum: string; sessionId: string; timestamp: number }
): Promise<{ success: boolean; newHighScore: boolean; rank: number }> {
  const res = await fetch(`${API_BASE}/leaderboard/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit score');
  return res.json();
}
