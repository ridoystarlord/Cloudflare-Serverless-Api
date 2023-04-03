import { Hono } from "hono";
import { whatsAppVerification } from "../controllers/webhookController";

const router = new Hono();

router.post("/whatsapp-wh-b-b-e-verification", whatsAppVerification);

export default router;
