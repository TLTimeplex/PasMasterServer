import express from 'express';
import { RowDataPacket } from 'mysql2';
import { getDBConnection } from '../../db';
import bcrypt from 'bcrypt';

let router = express.Router();

// Check if the user is authorized to use the system
router.use(async (req, res, next) => {
  let confirmPassword = req.body.password;
  if (!confirmPassword) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }
  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT Password_Hash FROM Users WHERE System_ID = ?', [req.query.system_id]);

  if (rows.length === 0) {
    return res.status(400).json({
      message: 'System not found',
    });
  }

  let passwordHash = rows[0].Password_Hash;

  if (!bcrypt.compareSync(confirmPassword, passwordHash)) {
    return res.status(400).json({
      message: 'Invalid password',
    });
  }

  next();
});


// Delete all data from a system
router.delete('/', async (req, res) => {
  let db = getDBConnection();

  await db.execute('DELETE FROM Data_Relation WHERE System_ID = ?', [req.query.system_id]);

  return res.status(200).json({
    message: 'success',
  });
});

// Delete specific data from all device
router.delete('/:data', async (req, res) => {
  let db = getDBConnection();

  // Check if data is owned by the system
  let [rows] = await db.query<RowDataPacket[]>('SELECT System_ID FROM Data_Relation WHERE Data_ID = ?', [req.params.data]);
  if (rows.length === 0 || rows[0].System_ID !== req.query.system_id) {
    return res.status(400).json({
      message: 'Data not found',
    });
  }

  await db.execute('DELETE FROM Data_Relation WHERE Data_ID = ?', [req.params.data]);

  return res.status(200).json({
    message: 'success',
  });
});

// Delete specific data from a device
router.delete('/device/:device/:data', async (req, res) => {
  let db = getDBConnection();

  // Check if data is owned by the system => Automatically checks if data is owned by the device too
  let [rows] = await db.query<RowDataPacket[]>('SELECT System_ID FROM Data_Relation WHERE Data_ID = ?', [req.params.data]);
  if (rows.length === 0 || rows[0].System_ID !== req.query.system_id) {
    return res.status(400).json({
      message: 'Data not found',
    });
  }

  await db.execute('DELETE FROM Data WHERE Data_ID = ? AND Device_ID = ?', [req.params.data, req.params.device]);

  // Check if entry is dead
  [rows] = await db.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM Data WHERE Data_ID = ?', [req.params.data]);
  if (rows[0].count === 0) {
    await db.execute('DELETE FROM Data_Relation WHERE Data_ID = ?', [req.params.data]);
  }

  return res.status(200).json({
    message: 'success',
  });
});

// Delete all data from a device
router.delete('/device/:device', async (req, res) => {
  let db = getDBConnection();

  // Check if device is owned by the system
  let [rows] = await db.query<RowDataPacket[]>('SELECT System_ID FROM Devices WHERE Device_ID = ?', [req.params.device]);
  if (rows.length === 0 || rows[0].System_ID !== req.query.system_id) {
    return res.status(400).json({
      message: 'Device not found',
    });
  }

  await db.execute('DELETE FROM Data WHERE Device_ID = ?', [req.params.device]);

  [rows] = await db.query<RowDataPacket[]>('SELECT Data_ID FROM Data_Relation WHERE System_ID = ? AND Data_ID NOT IN (SELECT Data_Relation.Data_ID FROM Data_Relation JOIN Data ON Data_Relation.Data_ID = Data.Data_ID WHERE System_ID = ? GROUP BY Data_Relation.Data_ID)', [req.query.system_id, req.query.system_id]);

  for (let row of rows) {
    await db.execute('DELETE FROM Data_Relation WHERE Data_ID = ?', [row.Data_ID]);
  }

  return res.status(200).json({
    message: 'success',
  });
});

export default router;