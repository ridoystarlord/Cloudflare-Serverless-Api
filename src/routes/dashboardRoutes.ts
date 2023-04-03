import { Hono } from "hono";
import { getAllCount } from "../controllers/dashboardController";

const router = new Hono();

router.get('/count', getAllCount)

export default router;