import { Context } from "hono";
import { databaseConnection } from "../Database";
import bcrypt from "bcryptjs";
import { ObjectId, User } from "../models";
import { PermissionsDefaultValues } from "../DefaultValues";
import { getAuthUserId, isAdminOrSuperAdmin } from "../utils";

export const getAllUsers = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!bearerToken || !userId) {
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
    if (isAuthUserAdminOrSuperAdmin) {
      const usersCollection =
        databaseConnectionResponse.dbConnection.collection("users");
      let allUsers = [];
      const dbAllUsers = await usersCollection.aggregate([
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
      if (dbAllUsers.length) {
        allUsers = dbAllUsers.map((ls: any) => {
          const newUserData = { ...ls };
          delete newUserData.Password;
          return newUserData;
        });
      }
      return c.json(
        {
          count: allUsers.length,
          data: allUsers,
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

export const createNewUser = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const companyCollection =
      databaseConnectionResponse.dbConnection.collection("companies");
    const body = await c.req.json();
    const {
      FirstName,
      LastName,
      Region,
      Avatar,
      Email,
      Password,
      Phone,
      Permissions,
      Company,
      UserType,
      APIKEY,
    } = body;
    if (!FirstName) {
      return c.json(
        {
          success: false,
          message: "FirstName is Required",
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
    if (!Password) {
      return c.json(
        {
          success: false,
          message: "Password is Required",
          result: null,
        },
        403
      );
    }
    const isUserExists = await usersCollection.findOne({
      Email: Email,
    });
    const isCompanyValid = await companyCollection.findOne({
      _id: new ObjectId(Company),
    });
    if (isCompanyValid == null) {
      return c.json("Please Provide a valid company", 409);
    }
    if (isUserExists) {
      return c.json(
        {
          success: false,
          message: "This Email Already Exists",
        },
        409
      );
    }
    let salt = bcrypt.genSaltSync(10);
    let hashPassword = bcrypt.hashSync(Password, salt);
    const newUserData: User = {
      Type: "user",
      FirstName: FirstName ?? "",
      LastName: LastName ?? "",
      Region: Region ?? "",
      Avatar: Avatar ?? "",
      Email: Email,
      Password: hashPassword,
      Phone: Phone ?? "",
      Permissions: Permissions ?? PermissionsDefaultValues,
      Company: Company ? new ObjectId(Company) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      UserType: UserType ?? "general",
      APIKEY: APIKEY ?? "",
    };
    const user = await usersCollection.insertOne({ ...newUserData });
    return c.json(user.insertedId, 200);
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
export const getUserByCompany = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    let dbUserCompany = await usersCollection.aggregate([
      { $match: { Company: new ObjectId(user.Company), Type: "user" } },
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
    return c.json(
      { success: true, count: dbUserCompany.length, data: dbUserCompany },
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

export const getSingleUser = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const id = c.req.param("rowid");

    const dbSingleUser = await usersCollection.aggregate([
      { $match: { _id: new ObjectId(id) } },
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
      delete dbSingleUser[0].Password;
      return c.json(dbSingleUser[0], 200);
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
export const updateUser = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const id = new ObjectId(c.req.param("updateuserid"));
    const user = await usersCollection.findOne({
      _id: new ObjectId(id),
    });
    if (user) {
      const body = await c.req.json();
      if (body._id) {
        delete body._id;
      }
      for (let key in body) {
        if (body.hasOwnProperty(key)) {
          if (key == "Password" && body[key]) {
            let salt = await bcrypt.genSaltSync(10);
            let hashPassword = await bcrypt.hashSync(body.Password, salt);
            user.Password = hashPassword;
          } else {
            user[key] = body[key];
          }
        }
      }
      user.updatedAt = new Date();
      const updateUser = await usersCollection.findOneAndUpdate(
        {
          _id: user._id,
        },
        user,
        { returnNewDocument: true }
      );
      const dbSingleUser = await usersCollection.aggregate([
        { $match: { _id: new ObjectId(updateUser._id) } },
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
        delete dbSingleUser[0].Password;
        return c.json(dbSingleUser[0], 200);
      }
      return c.json("no results found", 404);
    } else {
      return c.json("no results found", 404);
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

export const updatePassword = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const body = await c.req.json();
    const { oldPassword, newPassword, confirmPassword } = body;
    if (newPassword !== confirmPassword) {
      return c.json(
        {
          success: false,
          message: "Confirm Password did not match. Please try again.",
        },
        400
      );
    }
    const id = c.req.param("id");
    const user = await usersCollection.findOne({
      _id: new ObjectId(id),
    });
    if (user) {
      const isPasswordValid = await bcrypt.compare(oldPassword, user.Password);
      if (isPasswordValid) {
        let salt = await bcrypt.genSaltSync(10);
        let hashPassword = await bcrypt.hashSync(newPassword, salt);
        for (let key in user) {
          if (user.hasOwnProperty(key)) {
            if (key == "Password" && user[key]) {
              user.Password = hashPassword;
            }
          }
        }
        const updateUser = await usersCollection.findOneAndUpdate(
          {
            _id: new ObjectId(id),
          },
          user,
          { returnNewDocument: true }
        );
        return c.json({
          success: true,
          user: updateUser._id,
          message: "Password Updated Successfully!",
        });
      } else {
        return c.json(
          {
            success: false,
            message: "Old Password did not match. Please try again.",
          },
          401
        );
      }
    } else {
      return c.json(
        {
          success: false,
          user: null,
          message: "User not found",
        },
        400
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

export const deleteMember = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const id = c.req.param("deleteid");
    const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
    if (isAuthUserAdminOrSuperAdmin) {
      const deleteResponse = await usersCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (deleteResponse) {
        return c.json(
          {
            success: true,
            message: "User deleted",
          },
          200
        );
      } else {
        return c.json("no results found", 404);
      }
    }
    return c.json({
      success: false,
      message: "Permission denied.",
    });
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
