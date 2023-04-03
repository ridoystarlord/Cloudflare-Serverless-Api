import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import {
  createNewProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  createBulkProducts
} from "../controllers/productControllers";

const router = new Hono();

router.post(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  createNewProduct
);
router.get(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  getAllProducts
);
router.get(
  "/:id",
  jwt({
    secret: jwtSecret,
  }),
  getSingleProduct
);
router.patch(
  "/:id",
  jwt({
    secret: jwtSecret,
  }),
  updateProduct
);
router.delete(
  "/:id",
  jwt({
    secret: jwtSecret,
  }),
  deleteProduct
);

router.post('/bulk/create', jwt({
  secret: jwtSecret,
}),createBulkProducts)

export default router;
