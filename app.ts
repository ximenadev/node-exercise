import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { AppError, apiLimiter, parseQuery } from './utils';
import { globalErrorHandler } from './modules/errors/error.controller';

const app = express();

app.use(helmet());

// Express 5 defaults to 'simple', which doesn't parse price[gte]=500
app.set('query parser', parseQuery);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter);

app.use(express.json());
app.use(express.static('public'));

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
