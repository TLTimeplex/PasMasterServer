import express from 'express';
import { getDBConnection } from '../../db';
import { RowDataPacket } from 'mysql2';

let router = express.Router();

router.get('/', async (req, res) => {
  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT Device_ID AS id, Public_Key AS publicRSAKey, Device_Description AS description, Activated AS activatedBy FROM Devices WHERE System_ID = ?', [req.query.system_id]);

  res.status(200).json(rows);
});

export default router;