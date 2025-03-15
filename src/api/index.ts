import express from 'express';

import devices from './devices';
import { getDBConnection } from '../db';
import { RowDataPacket } from 'mysql2/promise';

const router = express.Router();

// Middleware : Check if user user is authenticated
// - Check if token is valid for any device and not expired
// - Check if the source of the request has changed
// - Check if the device is still activated
// - If the user is not authenticated, return 401
// - If the user is authenticated, continue to the next
router.use(async (req, res, next) => {
  let token = req.headers['api-token'];
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  // Check if token is valid for any device and not expired
  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Devices WHERE API_Token = ?', [token]);

  if (rows.length === 0) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  if (rows.length > 1) {
    // TODO: Remove this token from all devices
    return res.status(500).json({
      message: 'Internal Server error, please login again',
    });
  }

  let device = rows[0];

  let expire = new Date(device.Token_Expire);

  if (expire < new Date()) {
    // TODO: Remove this token from device
    return res.status(400).json({
      message: 'Token no longer valid',
    });
  }

  // Check if the source of the request has changed
  if (device.Last_Connection !== req.ip) {
    return res.status(400).json({
      message: 'IP-Address changed. Please login again',
    });
  }

  // Check if the device is still activated
  if (!device.Activated) {
    return res.status(400).json({
      message: 'Device is not activated',
    });
  }

  req.query.system_id = device.System_ID; // TODO: Check if this is allowed
  req.query.device_id = device.Device_ID; // TODO: Check if this is allowed

  next();
});

router.get<{}, any>('/', (req, res) => {
  res.status(200).json({
    message: 'User is authenticated',
  });
});

router.use('/devices', devices);

export default router;
