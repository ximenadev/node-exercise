import express from 'express';
import morgan from 'morgan';
import routes from './routes';

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use('/api/v1', routes);

export default app;
