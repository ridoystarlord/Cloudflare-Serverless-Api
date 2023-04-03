import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import { sendEmail } from "../controllers/supportController";

const router = new Hono();

router.post(
  "/email",
  jwt({
    secret: jwtSecret,
  }),
  sendEmail
);

export default router;
