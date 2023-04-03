import { Context } from "hono";
import { databaseConnection } from "../Database";
import { ObjectId, QrCode, Product } from "../models";
import { getAuthUserId, isAdminOrSuperAdmin } from "../utils";
import { QrCodeDefaultValue } from "../DefaultValues";
import { uuid } from "@cfworker/uuid";

export const getQrCodesByProduct = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const id = c.req.param("productId");
    const data = await qrCodesCollection.find({ Product: new ObjectId(id) });
    return c.json({ count: data.length, data }, 200);
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
export const getLastQrCodeSerial = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    const companyId = user.Company;
    const lastData = await qrCodesCollection.find({ Company: companyId });
    // .sort({ _id: -1 })
    // .limit(1);
    return c.json({ lastData, companyId }, 200);
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

export const getAllQrCodes = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
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
    let filter = {};
    const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);

    if (!isAuthUserAdminOrSuperAdmin) {
      //@ts-expect-error
      filter.Owner = new ObjectId(userId);
    }
    const dbAllqrCodes = await qrCodesCollection.find(filter);
    return c.json(
      {
        success: true,
        message: "All qrCodes Retrieve Successful",
        result: dbAllqrCodes,
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

export const getQrCodeLabelByIdentifier = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const body = await c.req.json();
    const response = await qrCodesCollection.findOne({
      _id: { $in: body.identifier },
      Label: { $ne: "" },
    });
    return c.json(response, 200);
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

export const generateQrCodes = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const productsCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    if (!userId) {
      return c.json(
        {
          success: false,
          message: "Unauthorized",
          result: null,
        },
        401
      );
    }
    const body = await c.req.json();

    if (
      body.productId &&
      body.noOfQrCodes &&
      body.leadingZero &&
      body.serial &&
      body.prefix
    ) {
      let productfilter = { _id: new ObjectId(body.productId) };

      const product = await productsCollection.findOne(productfilter);
      if (!product) {
        return c.json(
          {
            success: false,
            message: "Invalid Request",
          },
          400
        );
      }

      if (product.QrSerialPrefix != body.prefix) {
        product.QrSerialPrefix = body.prefix;
      }

      if (body.leadingZero && product.QrMaxLeadingZero != body.leadingZero) {
        product.QrMaxLeadingZero = body.leadingZero;
      }

      const updateProduct = await productsCollection.findOneAndUpdate(
        productfilter,
        product,
        { returnNewDocument: true }
      );
      let prefix = body.prefix;
      let leadingZero = body.leadingZero;
      let productId = body.productId;
      let noOfQrCodes = body.noOfQrCodes;
      let serial = body.serial;
      if (prefix) {
        prefix += "-";
      }
      let qrCodeList = [];
      let insertCounter = 0;

      for (let i = 0; i < body.noOfQrCodes; i++) {
        let leadingZeroString = "";
        if (leadingZero && leadingZero > (i + 1).toString().length) {
          let counter = leadingZero - (i + 1).toString().length;
          while (counter-- != 0) {
            leadingZeroString += "0";
          }
        }
        let qrCodeData = {
          Product: productId,
          Serial: `${prefix}${leadingZeroString}${serial++}`,
          Identifier: uuid(),
          PIN: generateRandomStringPIN(),
        };
        qrCodeList.push(qrCodeData);
        if (qrCodeList.length % 100 == 0) {
          const qrCodeInsertResponse = await qrCodesCollection.insertMany(
            qrCodeList
          );
          if (qrCodeInsertResponse) {
            insertCounter += qrCodeList.length;
            qrCodeList = [];
            if (insertCounter == noOfQrCodes) {
              c.json(
                {
                  success: true,
                  message: "Successfully generated.",
                },
                200
              );
            }
          }
        }

        if (qrCodeList.length > 0) {
          const qrCodeInsertResponse = await qrCodesCollection.insertMany(
            qrCodeList
          );
          if (qrCodeInsertResponse) {
            return c.json(
              {
                success: true,
                message: "Successfully generated.",
              },
              200
            );
          }
        }
      }
    } else {
      return c.json(
        {
          success: true,
          message: "Invalid Request",
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

export const getIndependentQrCodes = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
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
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    const response = await qrCodesCollection.find({ Company: user.Company });
    return c.json(response, 200);
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

export const generateIndependentQrCodes = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);

    const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (!isAuthUserAdminOrSuperAdmin || !user.Permissions.addQr) {
      return c.json(
        {
          success: false,
          message: "Permission denied.",
          result: null,
        },
        401
      );
    }
    const body = await c.req.json();
    const companyId = user.Company;
    let { noOfQrCodes, leadingZero, serial, prefix } = body;
    if (!companyId || !noOfQrCodes || !serial) {
      return c.json("Missing required parameter", 400);
    }
    if (noOfQrCodes > 1000) {
      return c.json("Max Limit Exceeded", 400);
    }
    let qrCodeList = [];
    for (let i = 0; i < noOfQrCodes; i++) {
      let leadingZeroString = "";
      if (leadingZero && leadingZero > (i + 1).toString().length) {
        let counter = leadingZero - (i + 1).toString().length;
        while (counter-- != 0) {
          leadingZeroString += "0";
        }
      }
      let qrCodeData = {
        Company: companyId,
        Serial: `${prefix}${leadingZeroString}${serial}`,
        SerialNumber: serial,
        Identifier: uuid(),
        PIN: generateRandomStringPIN(),
      };
      serial++;
      qrCodeList.push(qrCodeData);
    }
    if (qrCodeList.length > 0) {
      const response = await qrCodesCollection.insertMany(qrCodeList);
      if (response) {
        return c.json({ success: true, msg: "Successfully generated." }, 200);
      }
      return c.json({ success: false, msg: "Failed to generate" }, 500);
    }
    const response = await qrCodesCollection.find({ Company: user.Company });
    return c.json(response, 200);
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

export const assignIndependentQrToProduct = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrCodes");
    const id = c.req.param("id");

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
    const usersCollection =
      databaseConnectionResponse.dbConnection.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    const body = await c.req.json();
    const companyId = user.Company._id;
    let productId = body.productId;
    let qrCodes = body.qrCodes;
    const productsCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const manualInput = body.manualInput;
    if (!manualInput) {
      if (productId && companyId && qrCodes.length > 0) {
        const product = await productsCollection.findOne({ _id: productId });
        const qrCodesRes = await qrCodesCollection.updateMany(
          {
            _id: { $in: qrCodes },
            Product: null,
            Company: companyId,
          },
          { $set: { Product: productId } }
        );
        if (qrCodesRes) {
          product.QrGenerated = true;
          const updateProduct = await productsCollection.findOneAndUpdate(
            {
              _id: productId,
            },
            product,
            { returnNewDocument: true }
          );
          if (updateProduct) {
            return c.json({ success: true });
          }
          return c.json({ success: false, message: "Something went wrong" });
        }
        return c.json({ success: false, message: "Product not found" });
      }
    } else {
      const serialFromValue = body.serialFromValue;
      const serialToValue = body.serialToValue;
      if (productId && companyId && serialFromValue && serialToValue) {
        const product = await productsCollection.findOne({ _id: productId });
        const qrCodesRes = await qrCodesCollection.updateMany(
          {
            SerialNumber: { $gte: serialFromValue, $lte: serialToValue },
            Product: null,
            Company: companyId,
          },
          { $set: { Product: productId } }
        );
        if (qrCodesRes) {
          product.QrGenerated = true;
          const updateProduct = await productsCollection.findOneAndUpdate(
            {
              _id: productId,
            },
            product,
            { returnNewDocument: true }
          );
          if (updateProduct) {
            return c.json({ success: true });
          }
          return c.json({ success: false, message: "Something went wrong" });
        }
        return c.json({ success: false, message: "Product not found" });
      } else {
        return c.json({ success: false, message: "Something went wrong" });
      }
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

export const getSingleQrCodeByIdentifierBeforeVerify = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const identifier = c.req.param("identifiera");
    const qrCode = await qrCodesCollection.findOne({
      Identifier: identifier,
    });
    return c.json(qrCode, 200);
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

export const verifyQrCodePin = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const body = await c.req.json();
    const qrCode = await qrCodesCollection.findOne({
      PIN: body.PIN,
      Identifier: body.identifier,
    });
    return c.json(qrCode, 200);
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

export const getSingleQrCodeByIdentifierAfterVerify = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const identifier = c.req.param("identifier");
    const qrCode = await qrCodesCollection.findOne({
      Identifier: identifier,
    });
    return c.json(qrCode, 200);
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

export const getSingleQrCode = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const id = c.req.param("id");

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

    if (id) {
      let filter = { _id: new ObjectId(id) };

      const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
      if (!isAuthUserAdminOrSuperAdmin) {
        //@ts-expect-error
        filter.Owner = new ObjectId(userId);
      }
      const qrCode = await qrCodesCollection.findOne(filter);
      if (qrCode) {
        return c.json(
          {
            success: true,
            message: "Single Qr Code Information Retrieve Successful",
            result: qrCode,
          },
          200
        );
      } else {
        return c.json(
          {
            success: true,
            message: "Invalid Request",
          },
          400
        );
      }
    } else {
      return c.json(
        {
          success: true,
          message: "Invalid Request",
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

export const getSingleQrCodeByIdentifier = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const identifier = c.req.param("identifier");

    if (identifier) {
      let filter = { Identifier: identifier };

      const qrCode = await qrCodesCollection.findOne(filter);
      if (qrCode) {
        return c.json(
          {
            success: true,
            message:
              "Single Qr Code Information By Identifier Retrieve Successful",
            result: qrCode,
          },
          200
        );
      } else {
        return c.json(
          {
            success: true,
            message: "Invalid Request",
          },
          400
        );
      }
    } else {
      return c.json(
        {
          success: true,
          message: "Invalid Request",
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

const generateRandomStringPIN = async (limitPin = 6) => {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomstringPin = "";
  for (let i = 0; i < limitPin; i++) {
    let rnumPin = Math.floor(Math.random() * chars.length);
    randomstringPin += chars.substring(rnumPin, rnumPin + 1);
  }
  return randomstringPin;
};

export const updateQrCode = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrCodes");
    const id = c.req.param("id");

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
    if (id) {
      const usersCollection =
        databaseConnectionResponse.dbConnection.collection("users");
      const user = await usersCollection.findOne({
        _id: new ObjectId(userId),
      });

      const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
      if (isAuthUserAdminOrSuperAdmin || user.Permissions.editQr) {
        let filter = { _id: new ObjectId(id) };
        const qrResponse = await qrCodesCollection.findOne(filter);
        const body = await c.req.json();
        if (body._id) {
          delete body._id;
        }
        for (let key in body) {
          if (body.hasOwnProperty(key)) {
            qrResponse[key] = body[key];
          }
        }
        qrResponse.updatedAt = new Date();
        const updateSurvey = await qrCodesCollection.findOneAndUpdate(
          {
            _id: id,
          },
          qrResponse,
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
            message: "Permission denied.",
            result: null,
          },
          401
        );
      }
    } else {
      return c.json(
        {
          success: true,
          message: "Invalid Request",
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

export const deleteQrCode = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodesCollection =
      databaseConnectionResponse.dbConnection.collection("qrCodes");
    const id = c.req.param("id");

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
    if (id) {
      let filter = { _id: new ObjectId(id) };

      const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
      if (isAuthUserAdminOrSuperAdmin) {
        const productDeleteResponse = await qrCodesCollection.deleteOne(filter);

        return c.json(
          {
            success: true,
            message: "Qr Code Deleted Successful",
            result: productDeleteResponse,
          },
          200
        );
      } else {
        //@ts-expect-error
        filter.Owner = new ObjectId(userId);
        const qrCode = await qrCodesCollection.findOne(filter);
        if (qrCode) {
          const productDeleteResponse = await qrCodesCollection.deleteOne(
            filter
          );

          return c.json(
            {
              success: true,
              message: "Qr Code Deleted Successful",
              result: productDeleteResponse,
            },
            200
          );
        } else {
          return c.json(
            {
              success: false,
              message: "You Don't have Permission to Delete this Product",
              result: null,
            },
            401
          );
        }
      }
    } else {
      return c.json(
        {
          success: true,
          message: "Invalid Request",
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
