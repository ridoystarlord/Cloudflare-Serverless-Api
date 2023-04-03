import { Hono } from "hono";

import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import {
  addLocation,
  createSurvey,
  deleteSurvey,
  getAllDatapointsReport,
  getAllSurvey,
  getDataPointsReportByProduct,
  updateSurvey,
} from "../controllers/surveyController";

const router = new Hono();
router.get("/", getAllSurvey);
router.get(
  "/reports",
  jwt({
    secret: jwtSecret,
  }),
  getAllDatapointsReport
);
router.get(
  "/reports/:productid",
  jwt({
    secret: jwtSecret,
  }),
  getDataPointsReportByProduct
);
// router.post("/", addLocation, createSurvey); //need to complete add location middleware
router.post("/", createSurvey);
router.post("/location", addLocation);
router.patch("/:updateid", updateSurvey);
router.delete("/:deleteid", deleteSurvey);

export default router;
