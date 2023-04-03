import { Hono } from "hono";
import {
  generateQrCodes,
  getSingleQrCodeByIdentifierAfterVerify,
} from "../controllers/qrCodeControllers";

const router = new Hono();

router.get(
  "/:api_key/qrcodes/identifier/:identifier",
  getSingleQrCodeByIdentifierAfterVerify
);
router.post("/:api_key/qrcodes/generate", generateQrCodes);

export default router;
