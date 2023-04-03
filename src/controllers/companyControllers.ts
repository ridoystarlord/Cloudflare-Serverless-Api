import { Context } from "hono";
import { databaseConnection } from "../Database";
import { Company, ObjectId } from "../models";
import { CompanyDefaultValues } from "../DefaultValues";
import {
  getAuthUserId,
  isAdminOrSuperAdmin,
  isSuperAdminMiddleware,
} from "../utils";

export const createNewCompany = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const companiesCollection =
      databaseConnectionResponse.dbConnection.collection("companies");
    const body = await c.req.json();
    const { Name, Plan, Email } = body;
    if (!Name) {
      return c.json(
        {
          success: false,
          message: "Name is Required",
          result: null,
        },
        403
      );
    }
    if (!Email) {
      return c.json(
        {
          success: false,
          message: "Email is Required",
          result: null,
        },
        403
      );
    }
    if (!Plan) {
      return c.json(
        {
          success: false,
          message: "Plan is Required",
          result: null,
        },
        403
      );
    }
    const newCompanyData: Company = {
      ...CompanyDefaultValues,
      Name: Name,
      Plan: Plan ? new ObjectId(Plan) : null,
      Email: Email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const company = await companiesCollection.insertOne({ ...newCompanyData });
    return c.json(company.insertedId, 200);
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

export const getAllCompany = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const companiesCollection =
      databaseConnectionResponse.dbConnection.collection("companies");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);

    const isAuthUserSuperAdminMiddleware = await isSuperAdminMiddleware(c, userId);
    if (isAuthUserSuperAdminMiddleware) {
      const dbAllCompanies = await companiesCollection.aggregate([
        {
          $lookup: {
            from: "plans",
            localField: "Plan",
            foreignField: "_id",
            as: "Plan",
          },
        },
        {
          $unwind: {
            path: "$Plan",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
      return c.json(
        {
          count: dbAllCompanies.length,
          data: dbAllCompanies,
        },
        200
      );
    } else {
      return c.json({
        success: false,
        message: "Permission denied.",
      });
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

export const getSingleCompany = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const companiesCollection =
      databaseConnectionResponse.dbConnection.collection("companies");
    const id = c.req.param("id");
    const dbSingleCompany = await companiesCollection.aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "plans",
          localField: "Plan",
          foreignField: "_id",
          as: "Plan",
        },
      },
      {
        $unwind: {
          path: "$Plan",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (dbSingleCompany.length) {
      return c.json(dbSingleCompany[0], 200);
    }
    return c.json("no results found", 404);
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

export const updateCompany = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const companiesCollection =
      databaseConnectionResponse.dbConnection.collection("companies");
    const id = c.req.param("id");
    const company = await companiesCollection.findOne({
      _id: new ObjectId(id),
    });
    const body = await c.req.json();
    if (body._id) {
      delete body._id;
    }
    for (let key in body) {
      if (body.hasOwnProperty(key)) {
        company[key] = body[key];
      }
    }
    company.updatedAt = new Date();
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const isAuthUserSuperAdminMiddleware = await isSuperAdminMiddleware(c, userId);
    if (isAuthUserSuperAdminMiddleware) {
      const updateCompany = await companiesCollection.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        company,
        { returnNewDocument: true }
      );
      if (updateCompany) {
        const dbSingleCompany = await companiesCollection.aggregate([
          { $match: { _id: new ObjectId(updateCompany._id) } },
          {
            $lookup: {
              from: "plans",
              localField: "Plan",
              foreignField: "_id",
              as: "Plan",
            },
          },
          {
            $unwind: {
              path: "$Plan",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);
        if (dbSingleCompany.length) {
          return c.json(dbSingleCompany[0], 200);
        }
      }
      return c.json("no results found", 404);
    } else {
      return c.json({
        success: false,
        message: "Permission denied.",
      });
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

export const deleteCompany = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const companiesCollection =
      databaseConnectionResponse.dbConnection.collection("companies");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const isAuthUserSuperAdminMiddleware = await isSuperAdminMiddleware(c, userId);
    const id = c.req.param("id");
    if (isAuthUserSuperAdminMiddleware) {
      const deleteResponse = await companiesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (deleteResponse) {
        return c.json(
          {
            success: true,
            message: "Company deleted",
          },
          200
        );
      } else {
        return c.json("no results found", 404);
      }
    } else {
      return c.json({
        success: false,
        message: "Permission denied.",
      });
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
