import express from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { getDBConnection } from './db';
import { randomUUID } from 'crypto';

let router = express.Router();

router.post('/', async (req, res) => {
  let publicRSAKey = req.headers['public-rsa-key'];
  let username = req.body.username;
  let passwordHash = req.body.password;
  if (!publicRSAKey || !passwordHash || !username) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Devices JOIN Users ON Devices.system_id = Users.system_id WHERE public_key = ? AND login = ?', [publicRSAKey, username]);

  if (rows.length === 0) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  let device = rows[0];

  if (device.Password_Hash !== passwordHash) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  // Create token
  let token = randomUUID();

  // Ip of the user
  let ip = req.headers['x-forwarded-for'] || req.ip;

  // Set the date of expiration
  let expiration = new Date();
  expiration.setHours(expiration.getHours() + (24 * 7));

  let deviceID = device.Device_ID;

  // Insert token into database
  await db.execute('UPDATE Devices SET API_Token = ?, Token_Expire = ?, Last_Connection = ? WHERE Device_ID = ?', [token, expiration, ip, deviceID]);


  res.status(200).json({
    message: 'success',
    token: token,
    expiration: expiration,
  });
});

export default router;