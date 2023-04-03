import { Context } from "hono";
import { databaseConnection } from "../Database";
import { ObjectId, Product } from "../models";
import {
  getAuthUserId,
  isAdminOrSuperAdmin,
  isProductOwner,
  isSuperAdminMiddleware,
} from "../utils";
import { ProductDefaultValue } from "../DefaultValues";

export const createNewProduct = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const productsCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const body = await c.req.json();
    const { Name, Description, BatchNo, ModeOfTransport, Quantity } = body;

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
    if (!Description) {
      return c.json(
        {
          success: false,
          message: "Description is Required",
          result: null,
        },
        403
      );
    }

    if (!BatchNo) {
      return c.json(
        {
          success: false,
          message: "BatchNo is Required",
          result: null,
        },
        403
      );
    }
    if (!Quantity) {
      return c.json(
        {
          success: false,
          message: "Quantity is Required",
          result: null,
        },
        403
      );
    }
    if (!ModeOfTransport) {
      return c.json(
        {
          success: false,
          message: "Mode Of Transport is Required",
          result: null,
        },
        403
      );
    }

    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);

    const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
    if (!isAuthUserAdminOrSuperAdmin) {
      return c.json({ success: false, message: "Permission denied." });
    }

    const newProductData: Product = {
      EnableQR: body.EnableQR ?? ProductDefaultValue.EnableQR,
      EnableSMS: body.EnableSMS ?? ProductDefaultValue.EnableSMS,
      EnablePTT: body.EnablePTT ?? ProductDefaultValue.EnablePTT,
      EnableGDC: body.EnableGDC ?? ProductDefaultValue.EnableGDC,
      QrGenerated: body.QrGenerated ?? ProductDefaultValue.QrGenerated,
      QrSerialPrefix: body.QrSerialPrefix ?? ProductDefaultValue.QrSerialPrefix,
      QrMaxLeadingZero:
        body.QrMaxLeadingZero ?? ProductDefaultValue.QrMaxLeadingZero,
      Quantity: body.Quantity ?? ProductDefaultValue.Quantity,
      Name: body.Name ?? ProductDefaultValue.Name,
      Description: body.Description ?? ProductDefaultValue.Description,
      GovtApprovalNo: body.GovtApprovalNo ?? ProductDefaultValue.GovtApprovalNo,
      Barcode: body.Barcode ?? ProductDefaultValue.Barcode,
      BatchNo: body.BatchNo ?? ProductDefaultValue.BatchNo,
      ManufactureAt: body.ManufactureAt ?? ProductDefaultValue.ManufactureAt,
      ExpireAt: body.ExpireAt ?? ProductDefaultValue.ExpireAt,
      Properties: body.Properties ?? ProductDefaultValue.Properties,
      Image: body.Image ?? ProductDefaultValue.Image,
      GS1NumberFrom: body.GS1NumberFrom ?? ProductDefaultValue.GS1NumberFrom,
      GS1NumberTo: body.GS1NumberTo ?? ProductDefaultValue.GS1NumberTo,
      ShipmentTrackingNo:
        body.ShipmentTrackingNo ?? ProductDefaultValue.ShipmentTrackingNo,
      ShipmentRouteFrom:
        body.ShipmentRouteFrom ?? ProductDefaultValue.ShipmentRouteFrom,
      ShipmentRouteTo:
        body.ShipmentRouteTo ?? ProductDefaultValue.ShipmentRouteTo,
      ShippersAddress:
        body.ShippersAddress ?? ProductDefaultValue.ShippersAddress,
      DestinationAddress:
        body.DestinationAddress ?? ProductDefaultValue.DestinationAddress,
      NumberOfPallets:
        body.NumberOfPallets ?? ProductDefaultValue.NumberOfPallets,
      NumberOfBoxes: body.NumberOfBoxes ?? ProductDefaultValue.NumberOfBoxes,
      ModeOfTransport:
        body.ModeOfTransport ?? ProductDefaultValue.ModeOfTransport,
      LocalDistributorName:
        body.LocalDistributorName ?? ProductDefaultValue.LocalDistributorName,
      LocalDistributorAddress:
        body.LocalDistributorAddress ??
        ProductDefaultValue.LocalDistributorAddress,
      LocalDistributorContactPerson:
        body.LocalDistributorContactPerson ??
        ProductDefaultValue.LocalDistributorContactPerson,
      LocalDistributorPhone:
        body.LocalDistributorPhone ?? ProductDefaultValue.LocalDistributorPhone,
      LocalDistributorEmail:
        body.LocalDistributorEmail ?? ProductDefaultValue.LocalDistributorEmail,
      CouponButtons: body.CouponButtons ?? ProductDefaultValue.CouponButtons,
      Company: body.Company
        ? new ObjectId(body.Company)
        : ProductDefaultValue.Company,
      CouponQuestions:
        body.CouponQuestions ?? ProductDefaultValue.CouponQuestions,
      Owner: userId ? new ObjectId(userId) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const productInsertResponse = await productsCollection.insertOne({
      ...newProductData,
    });
    return c.json(productInsertResponse.insertedId, 200);
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

export const getAllProducts = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const productsCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);

    const isAuthUserSuperAdmin = await isSuperAdminMiddleware(c, userId);

    if (!isAuthUserSuperAdmin) {
      const dbAllProducts = await productsCollection.aggregate([
        { $match: { Owner: new ObjectId(userId) } },
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
      return c.json({ count: dbAllProducts.length, data: dbAllProducts });
    }
    const dbAllProducts = await productsCollection.aggregate([
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
    return c.json({ count: dbAllProducts.length, data: dbAllProducts });
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
export const getSingleProduct = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const productsCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const id = c.req.param("id");

    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const isAuthUserProductOwner = await isProductOwner(c, userId, id);
    const isAuthUserSuperAdmin = await isSuperAdminMiddleware(c, userId);
    if (isAuthUserProductOwner || isAuthUserSuperAdmin) {
      const product = await productsCollection.aggregate([
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
      if (product.length > 0) {
        return c.json(product[0], 200);
      }
      return c.json("no results found", 200);
    }

    return c.json(
      {
        success: false,
        message: "Permission denied.",
      },
      404
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
export const updateProduct = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const productsCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const params = c.req.param("id");
    const id = new ObjectId(params);
    const product = await productsCollection.findOne({
      _id: id,
    });
    const body = await c.req.json();
    if (body._id) {
      delete body._id;
    }
    for (let key in body) {
      if (body.hasOwnProperty(key)) {
        product[key] = body[key];
      }
    }
    product.updatedAt = new Date();

    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);

    const isAuthUserProductOwner = await isProductOwner(c, userId, params);
    const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
    if (userId && (isAuthUserProductOwner || isAuthUserAdminOrSuperAdmin)) {
      const updateProduct = await productsCollection.findOneAndUpdate(
        {
          _id: id,
        },
        product,
        { returnNewDocument: true }
      );
      const singleProduct = await productsCollection.aggregate([
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
      if (singleProduct.length > 0) {
        return c.json(singleProduct[0], 200);
      }
      return c.json("no results found", 200);
    } else {
      return c.json(
        {
          success: false,
          message: "You Don't have Permission to Update this Product",
          result: null,
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

export const deleteProduct = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const productsCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const id = c.req.param("id");

    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);

    const isAuthUserProductOwner = await isProductOwner(c, userId, id);
    const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
    if (userId && (isAuthUserProductOwner || isAuthUserAdminOrSuperAdmin)) {
      const productDeleteResponse = await productsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (productDeleteResponse) {
        return c.json(
          {
            success: true,
            message: "Product deleted",
          },
          200
        );
      }
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

export const createBulkProducts = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const productsCollection =
      databaseConnectionResponse.dbConnection.collection("products");
    const bearerToken = c.req.header("authorization");
    const userId = await getAuthUserId(bearerToken);
    const isAuthUserAdminOrSuperAdmin = await isAdminOrSuperAdmin(c, userId);
    if (isAuthUserAdminOrSuperAdmin) {
      const body = await c.req.json();
      const response = await productsCollection.insertMany(body);
      if (response) {
        return c.json({ success: true, msg: "Successfully generated." });
      } else {
        return c.json({ success: false, msg: "Failed" });
      }
    }
    return c.json(
      {
        success: false,
        message: "Permission Denied",
      },
      401
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
