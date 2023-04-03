import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtSecret } from "../config";
import {
  checkExistingMigrationRequest,
  createChargeForTopUp,
  getCompanyPayments,
  getReceipts,
  makePayment,
  makePlanMigration,
  purchaseTopUp,
  webhookCheckoutSessionCompleted,
  webhookInvoicePaymentFailed,
  webhookInvoicePaymentSucceeded,
} from "../controllers/paymentController";

const router = new Hono();

router.post(
  "/",
  jwt({
    secret: jwtSecret,
  }),
  makePayment
);
router.get("/receipt", getReceipts);

router.post(
  "/wh-bbweb-checkout-session-completed",
  webhookCheckoutSessionCompleted
);
router.post(
  "/wh-bbweb-invoice-payment-succeeded",
  webhookInvoicePaymentSucceeded
);
router.post("/wh-bbweb-invoice-payment-failed", webhookInvoicePaymentFailed);
router.get(
  "/get-history",
  jwt({
    secret: jwtSecret,
  }),
  getCompanyPayments
);
router.post(
  "/migrate-plan",
  jwt({
    secret: jwtSecret,
  }),
  makePlanMigration
);
router.get(
  "/check-existing-migration-request",
  jwt({
    secret: jwtSecret,
  }),
  checkExistingMigrationRequest
);
router.post(
  "/purchase-top-up",
  jwt({
    secret: jwtSecret,
  }),
  purchaseTopUp,
  createChargeForTopUp
);

export default router;
