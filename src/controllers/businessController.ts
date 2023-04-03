import { Context } from "hono";
import { databaseConnection } from "../Database";
import { ObjectId } from "../models";
import { getAuthUserId, isAdminOrSuperAdmin } from "../utils";

export const getAllBusiness = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const businessCollection =
      databaseConnectionResponse.dbConnection.collection("businesses");
    const businessData = await businessCollection.find({});
    return c.json({ count: businessData.length, data: businessData }, 200);
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

export const createBusiness = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const businessCollection =
      databaseConnectionResponse.dbConnection.collection("businesses");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const body = await c.req.json();
    if (!userId) {
      delete body.IsApproved;
    }
    const responses = await businessCollection.insertOne(body);
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

export const disapproveBusiness = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const businessCollection =
      databaseConnectionResponse.dbConnection.collection("businesses");
    const body = await c.req.json();
    const business = await businessCollection.findOne({
      _id: new ObjectId(body.businessId),
    });

    const email = body.email;
    const message =
      "<p>Dear " +
      business.Name +
      ",</p> <p>Your application has been rejected.</p><p> Reason:" +
      body.message +
      "</p><p>Please fill the registration form again and be available on the phone for verification.</p>";
    if (body.businessId && message && email) {
      const subject = "Your Application Status - Brand Binary Enterprise";
      // emailHandler.sendMail(email, subject, message); //need to send email
    }
    const deleteResponse = await businessCollection.deleteOne({
      _id: business._id,
    });
    if (deleteResponse) {
      return c.json(
        {
          success: true,
          message: "Business Disapproved",
        },
        200
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

export const getSingleBusiness = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const businessCollection =
      databaseConnectionResponse.dbConnection.collection("businesses");
    const id = c.req.param("rowid");
    const businessData = await businessCollection.findOne({
      _id: new ObjectId(id),
    });
    return c.json(businessData, 200);
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

export const updateBusiness = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const businessCollection =
      databaseConnectionResponse.dbConnection.collection("businesses");
    const id = c.req.param("updateid");
    const business = await businessCollection.findOne({
      _id: new ObjectId(id),
    });
    const body = await c.req.json();
    if (body._id) {
      delete body._id;
    }
    for (let key in body) {
      if (body.hasOwnProperty(key)) {
        business[key] = body[key];
      }
    }
    business.updatedAt = new Date();
    const updateBusiness = await businessCollection.findOneAndUpdate(
      {
        _id: id,
      },
      business,
      { returnNewDocument: true }
    );
    if (updateBusiness) {
      return c.json(updateBusiness, 200);
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

export const deleteBusiness = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const businessCollection =
      databaseConnectionResponse.dbConnection.collection("businesses");
    const id = c.req.param("deleteid");
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
    const businessDeleteResponse = await businessCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (businessDeleteResponse) {
      return c.json(
        {
          success: true,
          message: "Business deleted",
        },
        200
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

export const getNewByCompany = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const businessCollection =
      databaseConnectionResponse.dbConnection.collection("businesses");
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const id = c.req.param("newid");
    const dbSingleUser = await usersCollection.aggregate([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: "companies",
          localField: "Company",
          foreignField: "_id",
          as: "Company",
        },
      },
      {
        $unwind: {
          path: "$Company",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "Company.Plan",
          foreignField: "_id",
          as: "Company.Plan",
        },
      },
      {
        $unwind: {
          path: "$Company.Plan",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (dbSingleUser.length) {
      const userData = dbSingleUser[0];
      if (userData.Company.Plan.StripePlanId == "government") {
        const response = await businessCollection.find({ IsApproved: false });
        return c.json({ success: true, data: response });
      } else {
        const response = await businessCollection.find({
          Company: new ObjectId(id),
          IsApproved: false,
        });
        return c.json({ success: true, data: response });
      }
    } else {
      return c.json("no results found", 400);
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

export const getByCompanyType = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const businessCollection =
      databaseConnectionResponse.dbConnection.collection("businesses");
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const id = c.req.param("id");
    const type = c.req.param("type");
    const dbSingleUser = await usersCollection.aggregate([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: "companies",
          localField: "Company",
          foreignField: "_id",
          as: "Company",
        },
      },
      {
        $unwind: {
          path: "$Company",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "Company.Plan",
          foreignField: "_id",
          as: "Company.Plan",
        },
      },
      {
        $unwind: {
          path: "$Company.Plan",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (dbSingleUser.length) {
      const userData = dbSingleUser[0];
      if (userData.Company.Plan.StripePlanId == "government") {
        const response = await businessCollection.find({
          Type: type,
          IsApproved: true,
        });
        return c.json({ success: true, data: response });
      } else {
        const response = await businessCollection.find({
          Type: type,
          Company: new ObjectId(id),
          IsApproved: true,
        });
        return c.json({ success: true, data: response });
      }
    } else {
      return c.json("no results found", 400);
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
