import { Hono } from "hono";
import { api } from "./v1";

const app = new Hono();

app.route("/v1", api);
app.get("/", (c) => c.text("hello"));

export default app;
