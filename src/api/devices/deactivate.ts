import express from 'express';
import { getDBConnection } from '../../db';
import { RowDataPacket } from 'mysql2';

let router = express.Router();

router.post('/', async (req, res) => {
  let selectedDeviceID = req.body.target;
  if (!selectedDeviceID) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  if (selectedDeviceID === req.query.device_id) {
    return res.status(400).json({
      message: 'Bad Request. Device can not deactivate itself',
    });
  }

  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Devices WHERE Device_ID = ? AND System_ID = ?', [selectedDeviceID, req.query.system_id]);

  if (rows.length === 0) {
    return res.status(404).json({
      message: 'Device not found',
    });
  }

  if (rows[0].Activated === null) {
    return res.status(400).json({
      message: 'Device already deactivated',
    });
  }

  await db.query<RowDataPacket[]>('UPDATE Devices SET Activated = null WHERE Device_ID = ?', [selectedDeviceID]);

  res.status(200).json({
    message: 'Device deactivated',
  });
});

export default router;