import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import {
  getAllBusiness,
  createBusiness,
  disapproveBusiness,
  getSingleBusiness,
  updateBusiness,
  deleteBusiness,
  getNewByCompany,
  getByCompanyType,
} from "../controllers/businessController";

const router = new Hono();

router.get(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  getAllBusiness
);

router.post("/", createBusiness);
router.post(
  "/disapprove",
  jwt({
    secret: jwtSecret,
  }),
  disapproveBusiness
);
router.get(
  "/:rowid",
  jwt({
    secret: jwtSecret,
  }),
  getSingleBusiness
);
router.patch(
  "/:updateid",
  jwt({
    secret: jwtSecret,
  }),
  updateBusiness
);
router.delete(
  "/:deleteid",
  jwt({
    secret: jwtSecret,
  }),
  deleteBusiness
);

router.get(
  "/new/company/:newid",
  jwt({
    secret: jwtSecret,
  }),
  getNewByCompany
); //not ready yet
router.get(
  "/company/:id/:type",
  jwt({
    secret: jwtSecret,
  }),
  getByCompanyType
); //not ready yet

export default router;
