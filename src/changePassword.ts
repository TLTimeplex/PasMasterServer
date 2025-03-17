import express from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { getDBConnection } from './db';
import bcrypt from 'bcrypt';

let router = express.Router();

router.post('/', async (req, res) => {
  let publicRSAKey = req.headers['public-rsa-key'];
  let username = req.body.username;
  let password = req.body.password;
  let newPassword = req.body.new_password;
  if (!publicRSAKey || !password || !username || !newPassword) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Devices JOIN Users ON Devices.system_id = Users.system_id WHERE public_key = ? AND Login = ?', [publicRSAKey, username]);

  if (rows.length === 0) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  let device = rows[0];

  if (!bcrypt.compareSync(password, device.Password_Hash)) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  // Update password
  let passwordHash = bcrypt.hashSync(newPassword, 12);

  await db.execute('UPDATE Users SET Password_Hash = ? WHERE Login = ?', [passwordHash, username]);

  res.status(200).json({
    message: 'success',
  });
});

export default router;