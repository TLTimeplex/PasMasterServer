import express from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { getDBConnection } from './db';

let router = express.Router();

router.post('/', async (req, res) => {
  let publicRSAKey = req.headers['public-rsa-key'];
  let username = req.body.username;
  let passwordHash = req.body.password;
  let description = req.body.description || '';
  if (!publicRSAKey || !passwordHash || !username) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  let db = getDBConnection();
  // Check if any device has the public key
  let [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Devices JOIN Users ON Devices.system_id = Users.system_id WHERE public_key = ? AND login = ?', [publicRSAKey, username]);

  if (rows.length !== 0) {
    return res.status(401).json({
      message: 'Device already registered',
    });
  }

  // Check if login is valid
  [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Users WHERE login = ?', [username]);

  if (rows.length === 0 || rows[0].Password_Hash !== passwordHash) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  let systemID = rows[0].System_ID;

  // Check if this is the first device
  [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Devices WHERE System_ID = ?', [systemID]);
  let firstDevice = rows.length === 0;

  // Insert device into database
  await db.execute('INSERT INTO Devices (System_ID, Public_Key, Device_Description) VALUES (?, ?, ?)', [systemID, publicRSAKey, description]);

  [rows] = await db.query<RowDataPacket[]>('SELECT LAST_INSERT_ID() AS id');

  let deviceID = rows[0].id;

  // If this is the first device, activate the first device
  if (firstDevice) {
    await db.execute('UPDATE Devices SET Activated = ? WHERE Device_ID = ?', [deviceID, deviceID]);
  }

  res.status(200).json({
    message: 'Device registered',
    device_id: deviceID,
    activated: firstDevice,
  });
});

export default router;