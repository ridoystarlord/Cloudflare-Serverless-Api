import { Context } from "hono";
import { databaseConnection } from "../Database";
import { DataPoint, ObjectId } from "../models";
import { CompanyDefaultValues } from "../DefaultValues";
import { getAuthUserId, isAdminOrSuperAdmin, isProductOwner } from "../utils";

export const sendEmail = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const datapointsCollection =
      databaseConnectionResponse.dbConnection.collection("datapoints");
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
