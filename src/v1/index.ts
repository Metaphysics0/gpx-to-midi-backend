import { Hono } from "hono";
import { convertApi } from "./convert";

export const api = new Hono();

api.route("/convert", convertApi);
