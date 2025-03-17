import express from 'express';
import { getDBConnection } from '../../db';
import { RowDataPacket } from 'mysql2/promise';

let router = express.Router();

// Get all data for this device
router.get('/', async (req, res) => {
  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT Data.Data_ID as "id", Data.Data as "data", Data.Key as "key" FROM pasmaster.Data WHERE Device_ID = ?', [req.query.device_id]);
  res.status(200).json(rows);
});

// Get specific data for this device
router.get('/:data', async (req, res) => {
  if (isNaN(parseInt(req.params.data))) {
    res.status(400).json({
      message: 'Invalid data ID',
    });
    return;
  }
  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT Data.Data_ID as "id", Data.Data as "data", Data.Key as "key" FROM pasmaster.Data WHERE Device_ID = ? AND Data_ID = ?', [req.query.device_id, req.params.data]);
  res.status(200).json(rows);
});

export default router;