import { Hono } from "hono";
import { getAllPlan, getSinglePlan } from "../controllers/planController";

const router = new Hono();

router.get("/", getAllPlan);
router.get("/:id", getSinglePlan);

export default router;
