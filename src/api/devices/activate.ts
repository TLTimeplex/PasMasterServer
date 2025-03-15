import express from 'express';
import { getDBConnection } from '../../db';
import { RowDataPacket } from 'mysql2';

let router = express.Router();

router.get('/', async (req, res) => {
  let selectedDeviceID = req.body.target;
  if (!selectedDeviceID) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  if (selectedDeviceID === req.query.device_id) {
    return res.status(400).json({
      message: 'Bad Request. Device can not activate itself',
    });
  }

  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Devices WHERE Device_ID = ? AND System_ID = ?', [selectedDeviceID, req.query.system_id]);

  if (rows.length === 0) {
    return res.status(404).json({
      message: 'Device not found',
    });
  }

  if (rows[0].Activated) {
    return res.status(400).json({
      message: 'Device already activated',
    });
  }

  await db.query<RowDataPacket[]>('UPDATE Devices SET Activated = ? WHERE Device_ID = ?', [req.query.device_id, selectedDeviceID]);

  res.status(200).json({
    message: 'Device activated',
  });
});

export default router;