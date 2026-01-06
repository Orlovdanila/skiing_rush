import { Router } from 'express';
import { validateTelegramInitData } from '../middleware/validateTG';

export const authRouter = Router();

authRouter.post('/telegram', async (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({ error: 'initData required' });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const isValid = validateTelegramInitData(initData, botToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid initData' });
    }

    // Parse user data from initData
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      return res.status(400).json({ error: 'User data not found' });
    }

    // TODO: Create/update user in database
    // TODO: Generate JWT token

    return res.json({
      token: 'jwt_token_placeholder',
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        photoUrl: user.photo_url
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});
