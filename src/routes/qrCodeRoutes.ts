import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import {
  generateQrCodes,
  deleteQrCode,
  getAllQrCodes,
  getSingleQrCode,
  getSingleQrCodeByIdentifier,
  getQrCodesByProduct,
  getLastQrCodeSerial,
  getQrCodeLabelByIdentifier,
  getIndependentQrCodes,
  updateQrCode,
  generateIndependentQrCodes,
  assignIndependentQrToProduct,
  getSingleQrCodeByIdentifierBeforeVerify,
  getSingleQrCodeByIdentifierAfterVerify,
  verifyQrCodePin,
} from "../controllers/qrCodeControllers";

const router = new Hono();

router.get(
  "/by-product/:productId",
  jwt({
    secret: jwtSecret,
  }),
  getQrCodesByProduct
);

router.get(
  "/last-serial",
  jwt({
    secret: jwtSecret,
  }),
  getLastQrCodeSerial
); //not ready yet

router.get(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  getAllQrCodes
);

router.get(
  "/label/by-id",
  jwt({
    secret: jwtSecret,
  }),
  getQrCodeLabelByIdentifier
);

router.post(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  generateQrCodes
);

router.get(
  "/get-independent-qr",
  jwt({
    secret: jwtSecret,
  }),
  getIndependentQrCodes
);

router.post(
  "/generate-independent-qr",
  jwt({
    secret: jwtSecret,
  }),
  generateIndependentQrCodes
);

router.post(
  "/assign-qr-to-product",
  jwt({
    secret: jwtSecret,
  }),
  assignIndependentQrToProduct
);

router.get(
  "/identifier-b/:identifier",
  getSingleQrCodeByIdentifierBeforeVerify
);
router.get(
  "/identifier-a/:identifiera",
  getSingleQrCodeByIdentifierAfterVerify
);
router.post("/verify", verifyQrCodePin);

router.get("/identifier/:identifier", getSingleQrCodeByIdentifier);
router.get(
  "/:id",
  jwt({
    secret: jwtSecret,
  }),
  getSingleQrCode
);
router.patch(
  "/:id",
  jwt({
    secret: jwtSecret,
  }),
  updateQrCode
);
router.delete(
  "/:id",
  jwt({
    secret: jwtSecret,
  }),
  deleteQrCode
);

export default router;
