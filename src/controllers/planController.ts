import { Context } from "hono";
import { databaseConnection } from "../Database";
import { Plan, ObjectId } from "../models";
import { CompanyDefaultValues } from "../DefaultValues";
import { getAuthUserId, isAdminOrSuperAdmin, isProductOwner } from "../utils";

export const getAllPlan = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const planCollection =
      databaseConnectionResponse.dbConnection.collection("plans");
    const planData = await planCollection.find({});
    return c.json(
      {
        count: planData.length,
        data: planData,
      },
      200
    );
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

export const getSinglePlan = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const planCollection =
      databaseConnectionResponse.dbConnection.collection("plans");
    const id = c.req.param("id");
    const planData = await planCollection.findOne({ _id: new ObjectId(id) });
    return c.json(planData, 200);
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
