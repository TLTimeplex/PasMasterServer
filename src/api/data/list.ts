import express from 'express';
import { getDBConnection } from '../../db';
import { RowDataPacket } from 'mysql2';

let router = express.Router();

// Get Meta-Data from all devices
router.get('/', async (req, res) => {
  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT Data.Data_ID AS dataID, Device_ID AS deviceID, Timestamp as timestamp FROM Data_Relation JOIN Data ON Data_Relation.Data_ID = Data.Data_ID WHERE System_ID = ? ORDER BY Data.Data_ID, Device_ID;', [req.query.system_id]);
  res.status(200).json(rows);
});

// Get Meta-Data from this device
router.get('/this', async (req, res) => {
  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT Data.Data_ID AS dataID, Timestamp as timestamp FROM Data_Relation JOIN Data ON Data_Relation.Data_ID = Data.Data_ID WHERE System_ID = ? AND Device_ID = ? ORDER BY Data.Data_ID, Device_ID;', [req.query.system_id, req.query.device_id]);
  res.status(200).json(rows);
});

// Get Meta-Data from a specific device
router.get('/:deviceID', async (req, res) => {
  // Check if deviceID is a number
  if (isNaN(parseInt(req.params.deviceID))) {
    res.status(400).json({
      message: 'Invalid deviceID',
    });
    return;
  }

  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT Data.Data_ID AS dataID, Timestamp as timestamp FROM Data_Relation JOIN Data ON Data_Relation.Data_ID = Data.Data_ID WHERE System_ID = ? AND Device_ID = ? ORDER BY Data.Data_ID, Device_ID;', [req.query.system_id, req.params.deviceID]);
  res.status(200).json(rows);
});


export default router;