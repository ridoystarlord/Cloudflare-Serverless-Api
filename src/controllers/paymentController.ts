import { Context } from "hono";
import { databaseConnection } from "../Database";
import { Payment, ObjectId } from "../models";
import { CompanyDefaultValues } from "../DefaultValues";
import { getAuthUserId, isAdminOrSuperAdmin, isProductOwner } from "../utils";

export const makePayment = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};

export const getReceipts = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};

export const webhookCheckoutSessionCompleted = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};

export const webhookInvoicePaymentSucceeded = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};

export const webhookInvoicePaymentFailed = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};

export const getCompanyPayments = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
    const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
    if (!isAuthUserAdminOrSuperAdmin) {
      return c.json(
        {
          success: false,
          message: "Permission denied.",
          result: null,
        },
        401
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};

export const makePlanMigration = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};

export const checkExistingMigrationRequest = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};

export const purchaseTopUp = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};

export const createChargeForTopUp = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const paymentsCollection =
      databaseConnectionResponse.dbConnection.collection("payments");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User Not Found",
          result: null,
        },
        404
      );
    }
  } else {
    return c.json(
      {
        success: false,
        user: null,
        message: databaseConnectionResponse?.message,
      },
      500
    );
  }
};
