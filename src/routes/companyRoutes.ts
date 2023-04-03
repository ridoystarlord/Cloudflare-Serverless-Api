import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import {
  createNewCompany,
  getAllCompany,
  getSingleCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companyControllers";

const router = new Hono();

router.post("/", createNewCompany);
router.get(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  getAllCompany
);
router.get(
  "/:id",
  jwt({
    secret: jwtSecret,
  }),
  getSingleCompany
);
router.patch(
  "/:id",
  jwt({
    secret: jwtSecret,
  }),
  updateCompany
);
router.delete(
  "/:id",
  jwt({
    secret: jwtSecret,
  }),
  deleteCompany
);

export default router;
