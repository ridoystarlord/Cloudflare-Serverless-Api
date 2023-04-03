import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import {
  createNewUser,
  deleteMember,
  getAllUsers,
  getSingleUser,
  getUserByCompany,
  updatePassword,
  updateUser,
} from "../controllers/userControllers";

const router = new Hono();

router.get(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  getAllUsers
);

router.post("/", createNewUser);

router.get(
  "/company",
  jwt({
    secret: jwtSecret,
  }),
  getUserByCompany
);

router.get(
  "/:rowid",
  jwt({
    secret: jwtSecret,
  }),
  getSingleUser
);
router.patch(
  "/:updateuserid",
  jwt({
    secret: jwtSecret,
  }),
  updateUser
);

router.patch(
  "/change-password/:id",
  jwt({
    secret: jwtSecret,
  }),
  updatePassword
);
router.delete(
  "/:deleteid",
  jwt({
    secret: jwtSecret,
  }),
  deleteMember
);

export default router;
