import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import Routes from "./routes";

type Bindings = {
  REALM_APPID: string;
  REALM_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", cors());
app.use("*", logger());
app.use("*", prettyJSON());

app.get("/", (c) => c.text("Welcome to Brand Binary Enterprise"));

app.route("/", Routes);

export default app;
