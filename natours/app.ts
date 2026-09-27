import express from 'express';
import routes from './routes';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/v1', routes);

const server = app.listen(port);

export default server;
