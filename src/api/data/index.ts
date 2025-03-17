import express from 'express';
import routeStore from './store';
import routeCreate from './create';
import routeList from './list';
import routeGet from './get';
import routeDelete from './delete';

let router = express.Router();

// Create new entry for this device
router.use('/create', routeCreate);
// Update entry for all devices and create for other devices
router.use('/store', routeStore);
// List all available data
router.use('/list', routeList);
// Get data for this device
router.use('/get', routeGet);
// Delete data
router.use('/delete', routeDelete);

export default router;