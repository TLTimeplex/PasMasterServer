import 'dotenv/config';
import mysql, { Pool } from 'mysql2/promise';

let pool: Pool;

export const getDBConnection = (): Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'pasmaster',
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
      password: process.env.MYSQL_PASSWORD || 'pasmaster',
      database: process.env.MYSQL_DATABASE || 'pasmaster',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 512,
    });
    console.log('MySQL-Pool created!');
  }
  return pool;
};