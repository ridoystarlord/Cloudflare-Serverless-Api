import { Context } from "hono";
import { databaseConnection } from "../Database";
import bcrypt from "bcryptjs";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { jwtSecret } from "../config";

export const getToken = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const body = await c.req.json();
    const email = body.email;
    const password = body.password;
    if (!email || !password) {
      return c.json(
        { success: false, user: null, message: "Email and Password Required" },
        403
      );
    }
    const user = await usersCollection.findOne({ Email: email, Type: { $in: ['admin', 'user'] } });
    if(user){
      const isPasswordValid = await bcrypt.compare(password, user.Password);
      if (isPasswordValid) {
        const token = await jwt.sign(
          {
            id: user._id,
            FirstName: user.FirstName,
            createdAt: user.createdAt,
            exp: Math.floor(Date.now() / 1000) + 7 * (24 * (60 * 60)),
          },
          jwtSecret
        );
        return c.json({ success: true, user: user._id, token: token }, 200);
      } else {
        return c.json(
          { success: false, user: null, message: "Wrong credentials" },
          401
        );
      }
    }else{
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

export const getAdminAuthToken = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const body = await c.req.json();
    const email = body.email;
    const password = body.password;
    if (!email || !password) {
      return c.json(
        { success: false, user: null, message: "Email and Password Required" },
        403
      );
    }
    const user = await usersCollection.findOne({ Email: email, Type: { $in: ['superadmin', 'central-admin'] } });
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (isPasswordValid) {
      const token = await jwt.sign(
        {
          id: user._id,
          FirstName: user.FirstName,
          createdAt: user.createdAt,
          exp: Math.floor(Date.now() / 1000) + 7 * (24 * (60 * 60)),
        },
        jwtSecret
      );
      return c.json({ success: true, user: user._id, token: token }, 200);
    } else {
      return c.json(
        { success: false, user: null, message: "Wrong credentials" },
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
