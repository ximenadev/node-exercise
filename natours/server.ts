import './env';
import mongoose from 'mongoose';
import app from './app';

// Process state is unreliable after an uncaught exception, so exit immediately
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION. Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

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

const port = process.env.PORT!;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION. Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default server;
