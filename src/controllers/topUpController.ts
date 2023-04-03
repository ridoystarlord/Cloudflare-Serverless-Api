import { Context } from "hono";
import { databaseConnection } from "../Database";
import { ObjectId } from "../models";

export const createTopUp = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const topUpCollection =
      databaseConnectionResponse.dbConnection.collection("topups");
    const body = await c.req.json();
    const result = await topUpCollection.insertOne(body);
    if (result) {
      return c.json(result.insertedId, 200);
    }
    return c.json("Something went wrong", 200);
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

export const getAllTopUp = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const topUpCollection =
      databaseConnectionResponse.dbConnection.collection("topups");
    const result = await topUpCollection.find({});
    return c.json({ count: result.length, data: result });
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

export const getSingleTopUp = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const topUpCollection =
      databaseConnectionResponse.dbConnection.collection("topups");
    const id = c.req.param("singleId");
    const result = await topUpCollection.findOne({ _id: new ObjectId(id) });
    return c.json(result, 200);
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

export const updateTopUp = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const topUpCollection =
      databaseConnectionResponse.dbConnection.collection("topups");
    const id = c.req.param("updateId");
    const topup = await topUpCollection.findOne({
      _id: id,
    });
    const body = await c.req.json();
    if (body._id) {
      delete body._id;
    }
    for (let key in body) {
      if (body.hasOwnProperty(key)) {
        topup[key] = body[key];
      }
    }
    topup.updatedAt = new Date();
    await topUpCollection.findOneAndUpdate(
      {
        _id: id,
      },
      topup,
      { returnNewDocument: true }
    );
    const result = await topUpCollection.findOne({
      _id: id,
    });
    return c.json(result, 200);
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

export const deleteTopUp = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const topUpCollection =
      databaseConnectionResponse.dbConnection.collection("topups");
    const id = c.req.param("deleteId");
    const result = await topUpCollection.deleteOne({ _id: new ObjectId(id) });
    return c.json(result, 200);
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
