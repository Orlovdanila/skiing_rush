-- Users table
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  first_name VARCHAR(255),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_played_at TIMESTAMP
);

-- Scores table
CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  score INT NOT NULL,
  distance INT NOT NULL,
  session_id UUID UNIQUE,
  checksum VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 1000000),
  CONSTRAINT valid_distance CHECK (distance >= 0)
);

-- Indexes
CREATE INDEX idx_scores_leaderboard ON scores (score DESC, created_at);
CREATE INDEX idx_scores_user ON scores (user_id, score DESC);

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(lim INT DEFAULT 100)
RETURNS TABLE (
  rank BIGINT,
  user_id BIGINT,
  username VARCHAR,
  first_name VARCHAR,
  score INT,
  created_at TIMESTAMP
) AS $$
  SELECT
    RANK() OVER (ORDER BY s.score DESC) as rank,
    u.id as user_id,
    u.username,
    u.first_name,
    s.score,
    s.created_at
  FROM scores s
  JOIN users u ON s.user_id = u.id
  WHERE s.score = (
    SELECT MAX(score) FROM scores WHERE user_id = s.user_id
  )
  ORDER BY s.score DESC
  LIMIT lim;
$$ LANGUAGE SQL;
