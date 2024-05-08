import { Hono } from 'hono';
import { convertController } from './controllers/convert.controller';
import { HTTPException } from 'hono/http-exception';
import { unknownServerError } from './utils/responses.util';

const app = new Hono();

app.route('/api/convert', convertController);

app.get('/', (c) => c.text('hello'));

app.onError((err) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return unknownServerError().getResponse();
});

export default {
  port: process.env.APP_PORT || 3002,
  fetch: app.fetch,
};
