import { Hono } from "hono";
import { api } from "./v1";
import { config } from "./env";

const app = new Hono();

app.route("/v1", api);
app.get("/", (c) => c.text("hello"));

export default {
  fetch: app.fetch,
  port: config.API_HOST_PORT,
};
