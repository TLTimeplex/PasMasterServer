import { NextFunction, Request, Response } from 'express';

import ErrorResponse from './interfaces/ErrorResponse';
import { getDBConnection } from './db';
import { RowDataPacket } from 'mysql2/promise';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

export function hasPublicKey(req: Request, res: Response, next: NextFunction) {
  if (!req.headers['public-rsa-key']) {
    return res.status(403).json({
      message: 'Forbidden',
    });
  }
  next();
}

export async function isKnown(req: Request, res: Response, next: NextFunction) {
  let publicRSAKey = req.headers['public-rsa-key'];
  if (!publicRSAKey) throw new Error('Internal Error: Public-rsa-key vanished?');

  let db = getDBConnection();
  let [rows] = await db.query<RowDataPacket[]>('SELECT * FROM Devices WHERE public_key = ?', [publicRSAKey]);
  if (rows.length === 0) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
  next();
}