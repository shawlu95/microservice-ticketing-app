import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  // Equivalent to (!req.session || !req.session.jwt)
  if (!req.session?.jwt) {
    return res.send({ currentUser: null });
  }

  try {
    const payload = jwt.verify(req.session.jwt, process.env.jwt!);
    return res.json(payload);
  } catch (err) {
    console.log('Invalid JWT', err);
    return res.send({ currentUser: null });
  }
});

export { router as currentUserRouter };
