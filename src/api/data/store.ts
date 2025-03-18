import express from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { getDBConnection } from '../../db';

let router = express.Router();

router.put('/:deviceID/:dataID', async (req, res) => {
  let deviceID = req.params.deviceID;
  let dataID = req.params.dataID;
  let data = req.body.data;
  let key = req.body.key;
  if (!deviceID || !dataID || !data || !key) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  let db = getDBConnection();

  // Check if device belongs to user
  let [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Devices WHERE Device_ID = ? AND System_ID = ?', [deviceID, req.query.system_id]);
  if (rows.length === 0) {
    return res.status(401).json({
      message: 'Device does not belong to user',
    });
  }

  // Check if dataID belongs to user
  [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Data_Relation WHERE Data_ID = ? AND System_ID = ?', [dataID, req.query.system_id]);
  if (rows.length === 0) {
    return res.status(401).json({
      message: 'Data does not belong to user',
    });
  }

  // Write data to database (Insert or Update)
  await db.query<RowDataPacket[]>('INSERT INTO Data (Data.Data_ID, Data.Device_ID, Data.Data, Data.Key) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE Data.Data = VALUES(Data.Data), Data.Key = VALUES(Data.Key)', [dataID, deviceID, data, key]);

  res.status(200).json({
    message: 'success',
  });
});

export default router;