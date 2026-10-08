import express from 'express';
import { signUp, signIn, signOut, refreshToken, googleAuth } from '../controllers/authControllers.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/signup",signUp);

router.post("/signin",signIn);

router.post("/signout",signOut);

router.post("/refresh", refreshToken);

router.post("/google", optionalAuth, googleAuth);


export default router;
