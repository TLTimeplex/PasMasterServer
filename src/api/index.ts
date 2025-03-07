import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import emojis from './emojis';

const router = express.Router();

router.get<{}, any>('/', (req, res) => {
  res.send(req.headers); 
});

router.use('/emojis', emojis);

export default router;
