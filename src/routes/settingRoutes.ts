import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import {
  createSetting,
  deleteSetting,
  getAllSetting,
  getSettingByName,
  getSingleSetting,
  getTopUpSettings,
  saveTopUpSettings,
  updateSetting,
} from "../controllers/settingController";

const router = new Hono();

router.post(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  createSetting
);
router.get(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  getAllSetting
);

router.get(
  "/topup-settings",
  jwt({
    secret: jwtSecret,
  }),
  getTopUpSettings
);
router.get(
  "/topup-settings",
  jwt({
    secret: jwtSecret,
  }),
  saveTopUpSettings
);

router.get(
  "/:singleId",
  jwt({
    secret: jwtSecret,
  }),
  getSingleSetting
);
router.patch(
  "/:keyId",
  jwt({
    secret: jwtSecret,
  }),
  updateSetting
);
router.delete(
  "/:deleteId",
  jwt({
    secret: jwtSecret,
  }),
  deleteSetting
);

router.get(
  "/get-by-name/:name",
  jwt({
    secret: jwtSecret,
  }),
  getSettingByName
);

export default router;
