import { Context } from "hono";
import { databaseConnection } from "../Database";
import { DataPoint, ObjectId } from "../models";
import { CompanyDefaultValues } from "../DefaultValues";
import { getAuthUserId, isAdminOrSuperAdmin, isProductOwner } from "../utils";

export const getAllSurvey = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const surveysCollection =
      databaseConnectionResponse.dbConnection.collection("surveys");
    const surveyData = await surveysCollection.find({});
    return c.json({ count: surveyData.length, data: surveyData }, 200);
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

export const getAllDatapointsReport = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const dataPointsCollection =
      databaseConnectionResponse.dbConnection.collection("datapoints");
    const productCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    const productId = await productCollection.find({ Company: user.Company });
    const data = await dataPointsCollection.find({
      Product: { $in: productId },
    });
    let responseData = {
      dataPointData: data,
      QrCodeLabelData: [],
    };
    return c.json(responseData, 200);
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

export const getDataPointsReportByProduct = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const dataPointsCollection =
      databaseConnectionResponse.dbConnection.collection("datapoints");
    const id = c.req.param("productid");
    const data = await dataPointsCollection.aggregate([
      { $match: { Product: new ObjectId(id) } },
      {
        $lookup: {
          from: "qrcodes",
          localField: "QrCode",
          foreignField: "_id",
          as: "QrCode",
        },
      },
      {
        $unwind: {
          path: "$QrCode",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "QrCode.Product",
          foreignField: "_id",
          as: "QrCode.Product",
        },
      },
      {
        $unwind: {
          path: "$QrCode.Product",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "QrCode.Product.Company",
          foreignField: "_id",
          as: "QrCode.Product.Company",
        },
      },
      {
        $unwind: {
          path: "$QrCode.Product.Company",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    let responseData = {
      dataPointData: [],
      QrCodeLabelData: [],
    };
    if (data.length > 0) {
      responseData.dataPointData = data[0];
      return c.json(responseData, 200);
    }
    return c.json(responseData, 200);
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

export const createSurvey = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const surveysCollection =
      databaseConnectionResponse.dbConnection.collection("surveys");
    const body = await c.req.json();
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
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
    const responses = await surveysCollection.insertOne(body);
    if (responses) {
      return c.json(responses.insertedId, 200);
    }
    return c.json("Something Went Wrong", 500);
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

export const updateSurvey = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const surveysCollection =
      databaseConnectionResponse.dbConnection.collection("surveys");
    const body = await c.req.json();
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
    if (!isAuthUserAdminOrSuperAdmin) {
      return c.json(
        {
          success: false,
          message: "Permission denied.",
        },
        401
      );
    }
    const id = c.req.param("updateid");
    const survey = await surveysCollection.findOne({ _id: new ObjectId(id) });
    if (body._id) {
      delete body._id;
    }
    for (let key in body) {
      if (body.hasOwnProperty(key)) {
        survey[key] = body[key];
      }
    }
    survey.updatedAt = new Date();
    const updateSurvey = await surveysCollection.findOneAndUpdate(
      {
        _id: id,
      },
      survey,
      { returnNewDocument: true }
    );
    if (updateSurvey) {
      return c.json(updateSurvey, 200);
    }
    return c.json("Something Went Wrong", 500);
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

export const deleteSurvey = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const surveysCollection =
      databaseConnectionResponse.dbConnection.collection("surveys");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const id = c.req.param("deleteid");

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
    const deleteResponse = await surveysCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteResponse) {
      return c.json(
        {
          success: false,
          message: "Surveys deleted",
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

export const addLocation = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const surveysCollection =
      databaseConnectionResponse.dbConnection.collection("surveys");
    const body = await c.req.json();
    if (body.Latitude && body.Longitude) {
      // const got = require("got");
      // got(
      //   "https://api.opencagedata.com/geocode/v1/json?q=" +
      //     req.body.Latitude +
      //     "+" +
      //     req.body.Longitude +
      //     "&key=1a4138a530fa42c3a5d913423e9ca9e7&min_confidence=9",
      //   { json: true }
      // )
      //   .then((response) => {
      //     req.body.GoogleLocationObject = response.body.results[0];
      //     next();
      //   })
      //   .catch((error) => {
      //     next();
      //   });
      return c.json("We are creating Add Location Api Soon", 200);
    } else {
      return c.json("Some Data Missing", 400);
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
