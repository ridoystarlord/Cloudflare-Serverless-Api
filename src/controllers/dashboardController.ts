import { Context } from "hono";
import { databaseConnection } from "../Database";
import { Business, Product, QrCode, DataPoint, ObjectId } from "../models";
import { CompanyDefaultValues } from "../DefaultValues";
import { getAuthUserId } from "../utils";

export const getAllCount = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const businessCollection =
      databaseConnectionResponse.dbConnection.collection("businesses");
    let responseData = {
      productCount: 0,
      qrCodeCount: 0,
      dataPointData: 0,
      approvedProduct: 0,
      newBusiness: 0,
      manufactures: 0,
      importers: 0,
      distributors: 0,
      pharmacies: 0,
    };
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
