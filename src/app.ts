import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api';
import login from './login';
import register from './register';
import change_password from './changePassword';

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', api);

// Check if the user has a friendly intend
app.use(middlewares.hasPublicKey);

app.use('/add_account', register);

// Check if the user is known
app.use(middlewares.isKnown);

app.use('/login', login);
app.use('/change_password', change_password); // TODO: Implement change_password

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
