import { Context } from "hono";
import { databaseConnection } from "../Database";
import { ObjectId } from "../models";
import jwt from "@tsndr/cloudflare-worker-jwt";

export const getAuthUserId = async (bearerToken: string | undefined) => {
  if (bearerToken) {
    let decodeData = await jwt.decode(bearerToken);
    return decodeData.payload.id;
  }
  return null;
};

export const isAdminOrSuperAdmin = async (c: Context, id: string) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(id),
    });
    if (
      user?.Type === "admin" ||
      user?.Type === "superadmin" ||
      user?.Type === "central-admin"
    ) {
      return true;
    }
    return false;
  } else {
    return false;
  }
};

export const isSuperAdminMiddleware = async (c: Context, id: string) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(id),
    });
    if (user?.Type === "superadmin") {
      return true;
    }
    return false;
  } else {
    return false;
  }
};

export const verifyAuthForQrProductData = async (
  bearerToken: string | undefined
) => {
  if (bearerToken) {
    let decodeData = await jwt.decode(bearerToken);
    return decodeData.payload.id;
  }
  return null;
};

export const SdkVerifyAuth = async (c: Context, apiKey: string) => {
  if (apiKey) {
    let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
    const databaseConnectionResponse = await db;
    if (
      !databaseConnectionResponse.error &&
      databaseConnectionResponse.dbConnection
    ) {
      const usersCollection =
        databaseConnectionResponse.dbConnection.collection("users");
      const user = await usersCollection.findOne({
        APIKEY: apiKey,
      });
      if (user) {
        return user;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const isProductOwner = async (
  c: Context,
  userId: string,
  productId: string
) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const productsCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    const product = await productsCollection.findOne({
      _id: new ObjectId(productId),
    });
    if (user?._id === product?.Owner) {
      return true;
    }
    return false;
  } else {
    return false;
  }
};
