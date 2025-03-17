import express from 'express';
import { getDBConnection } from '../../db';
import { RowDataPacket } from 'mysql2';

let router = express.Router();

router.put('/', async (req, res) => {
  let data = req.body.data;
  let key = req.body.key;

  if (data === undefined || key === undefined) {
    res.status(400).json({
      message: 'Missing data or key',
    });
    return;
  }

  let timestamp = new Date();
  let db = getDBConnection();
  await db.execute('INSERT INTO Data_Relation (System_ID, Timestamp) VALUES (?, ?)', [req.query.system_id, timestamp]);

  let [rows] = await db.query<RowDataPacket[]>('SELECT LAST_INSERT_ID() AS dataID;');
  let dataID = rows[0].dataID;

  await db.execute('INSERT INTO Data (Data_ID, Device_ID, Data, Data.Key) VALUES (?, ?, ?, ?)', [dataID, req.query.device_id, data, key]);

  res.status(200).json({
    dataID: dataID,
    timestamp: timestamp,
  });
});

export default router;