import { Hono } from 'hono';
import { convertController } from './controllers/convert.controller';

const app = new Hono();

app.route('/api/convert', convertController);

app.get('/', (c) => c.text('hello'));

export default app;
