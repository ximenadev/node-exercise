import express from 'express';
import morgan from 'morgan';
import routes from './routes';

const app = express();

// Express 5 defaults to 'simple', which doesn't parse price[gte]=500
app.set('query parser', 'extended');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use('/api/v1', routes);

export default app;
