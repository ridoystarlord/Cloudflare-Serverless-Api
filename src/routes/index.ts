import { Hono } from "hono";
import AuthRoutes from "./authRoutes";
import UserRoutes from "./userRoutes";
import ProductRoutes from "./productRoutes";
import CompanyRoutes from "./companyRoutes";
import QrCodeRoutes from "./qrCodeRoutes";
import SurveyRoutes from "./surveyRoutes";
import DashboardRoutes from "./dashboardRoutes";
import SdkRoutes from "./sdkRoutes";
import WebhookRoutes from "./webhookRoutes";
import BusinessRoutes from "./businessRoutes";
import PlanRoutes from "./planRoutes";
import PaymentRoutes from "./paymentRoutes";
import TopUpRoutes from "./topUpRoutes";
import SettingRoutes from "./settingRoutes";
import SupportRoutes from "./supportRoutes";

const router = new Hono();

router.route("/auth", AuthRoutes);
router.route("/company", CompanyRoutes);
router.route("/users", UserRoutes);
router.route("/products", ProductRoutes);
router.route("/survey", SurveyRoutes);
router.route("/plan", PlanRoutes);
router.route("/business", BusinessRoutes);
router.route("/settings", SettingRoutes);
router.route("/top-ups", TopUpRoutes);
router.route("/dashboard", DashboardRoutes);
router.route("/qrcodes", QrCodeRoutes);

router.route("/sdk", SdkRoutes);
router.route("/webhook", WebhookRoutes);
router.route("/payment", PaymentRoutes);
router.route("/support", SupportRoutes);

export default router;
