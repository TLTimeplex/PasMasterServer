import express from 'express';

import list from './list';
import activate from './activate';
import deactivate from './deactivate';

let router = express.Router();

router.use('/list', list);
router.use('/activate', activate);
router.use('/deactivate', deactivate);

export default router;