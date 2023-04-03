import { Hono } from "hono";
import { getToken, getAdminAuthToken } from "../controllers/authControllers";

const router = new Hono();
router.post("/token", getToken);
router.post('/admin/token', getAdminAuthToken)

export default router;
