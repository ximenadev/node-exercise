import mongoose from 'mongoose';
import app from './app';

process.loadEnvFile('./.env');

const DB = process.env
  .DB_URL!.replace('<USERNAME>', process.env.DB_USERNAME!)
  .replace('<PASSWORD>', process.env.DB_PASSWORD!);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful'))
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });

const server = app.listen(process.env.PORT);

export default server;
