import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import {
  createTopUp,
  deleteTopUp,
  getAllTopUp,
  getSingleTopUp,
  updateTopUp,
} from "../controllers/topUpController";

const router = new Hono();

router.post(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  createTopUp
);
router.get(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  getAllTopUp
);

router.get(
  "/:singleId",
  jwt({
    secret: jwtSecret,
  }),
  getSingleTopUp
);
router.patch(
  "/:updateId",
  jwt({
    secret: jwtSecret,
  }),
  updateTopUp
);
router.delete(
  "/:deleteId",
  jwt({
    secret: jwtSecret,
  }),
  deleteTopUp
);

export default router;
