import express from 'express';
import { registerUser, loginUser, getMe, googleAuth } from '../controllers/authControllers.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', optionalAuth, googleAuth);
router.get('/me', protect, getMe);

export default router;