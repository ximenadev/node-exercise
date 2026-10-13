import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { clientOrigins } from './env';
import routes from './routes';
import { AppError, apiLimiter, parseQuery } from './utils';
import { globalErrorHandler } from './modules/errors/error.controller';

const app = express();

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

app.use(
  helmet({
    crossOriginResourcePolicy: clientOrigins.length
      ? { policy: 'cross-origin' }
      : undefined,
  }),
);

if (clientOrigins.length) {
  app.use(cors({ origin: clientOrigins, credentials: true, maxAge: 600 }));
}

// Express 5 defaults to 'simple', which doesn't parse price[gte]=500
app.set('query parser', parseQuery);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1', routes);

app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

export default app;
