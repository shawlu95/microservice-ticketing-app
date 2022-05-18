import express from 'express';

const router = express.Router();

router.post('/api/users/signup', (req, res) => {
  return res.send('signup');
});

export { router as signupRouter };