import { Context } from "hono";
import { databaseConnection } from "../Database";
import { ObjectId } from "../models";
import { getAuthUserId, isAdminOrSuperAdmin, isProductOwner } from "../utils";

export const createSetting = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const settingsCollection =
      databaseConnectionResponse.dbConnection.collection("bbsettings");
    const body = await c.req.json();
    const response = await settingsCollection.insertOne(body);
    if (response) {
      return c.json(response.insertedId, 200);
    }
    return c.json("Something went wrong", 500);
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

export const getAllSetting = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const settingsCollection =
      databaseConnectionResponse.dbConnection.collection("bbsettings");
    const settingsData = await settingsCollection.find({});
    return c.json({ count: settingsData.length, data: settingsData }, 200);
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

export const getTopUpSettings = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const settingsCollection =
      databaseConnectionResponse.dbConnection.collection("bbsettings");

    // old api code
    // try {
    //   const settingName = req.params.name;
    //   Model.findOne({ Name: settingName }, (err, setting) => {
    //     if (!err && setting) {
    //       res.status(200).json(setting.toJSON());
    //     } else {
    //       res.status(404).json({ success: false, message: "Not found" });
    //     }
    //   });
    // } catch (error) {
    //   res.status(500).json({ success: false, message: "Failed" });
    // }
    // old api code
    return c.json("Not Ready Yet. Coming soon.", 200);
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

export const saveTopUpSettings = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const settingsCollection =
      databaseConnectionResponse.dbConnection.collection("bbsettings");
    //old Api code here
    // try {
    //   if (req.body.QRCodeUnitPrice != undefined) {
    //     Model.update(
    //       { Name: "QRCodeUnitPrice" },
    //       { Name: "QRCodeUnitPrice", Value: req.body.QRCodeUnitPrice },
    //       { upsert: true, setDefaultsOnInsert: true },
    //       function (err) {}
    //     );
    //   }
    //   if (req.body.SMSUnitPrice != undefined) {
    //     Model.update(
    //       { Name: "SMSUnitPrice" },
    //       { Name: "SMSUnitPrice", Value: req.body.SMSUnitPrice },
    //       { upsert: true, setDefaultsOnInsert: true },
    //       function (err) {}
    //     );
    //   }
    //   if (req.body.CampaignUnitPrice != undefined) {
    //     Model.update(
    //       { Name: "CampaignUnitPrice" },
    //       { Name: "CampaignUnitPrice", Value: req.body.CampaignUnitPrice },
    //       { upsert: true, setDefaultsOnInsert: true },
    //       function (err) {}
    //     );
    //   }
    //   if (req.body.TopUpValidity != undefined) {
    //     Model.update(
    //       { Name: "TopUpValidity" },
    //       { Name: "TopUpValidity", Value: req.body.TopUpValidity },
    //       { upsert: true, setDefaultsOnInsert: true },
    //       function (err) {}
    //     );
    //   }
    //   res.status(200).json({ success: true, message: "Success" });
    // } catch (error) {
    //   res.status(500).json({ success: false, message: "Failed" });
    // }
    //old Api code here
    return c.json("Not Ready Yet. Coming soon.", 200);
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

export const getSingleSetting = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const settingsCollection =
      databaseConnectionResponse.dbConnection.collection("bbsettings");
    const id = c.req.param("singleId");
    const result = await settingsCollection.findOne({ _id: new ObjectId(id) });
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

export const updateSetting = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const settingsCollection =
      databaseConnectionResponse.dbConnection.collection("bbsettings");
    const id = c.req.param("keyId");
    const settings = await settingsCollection.findOne({
      _id: id,
    });
    const body = await c.req.json();
    if (body._id) {
      delete body._id;
    }
    for (let key in body) {
      if (body.hasOwnProperty(key)) {
        settings[key] = body[key];
      }
    }
    settings.updatedAt = new Date();
    await settingsCollection.findOneAndUpdate(
      {
        _id: id,
      },
      settings,
      { returnNewDocument: true }
    );
    const result = await settingsCollection.findOne({
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

export const deleteSetting = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const settingsCollection =
      databaseConnectionResponse.dbConnection.collection("bbsettings");
    const id = c.req.param("deleteId");
    const result = await settingsCollection.deleteOne({
      _id: new ObjectId(id),
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

export const getSettingByName = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const settingsCollection =
      databaseConnectionResponse.dbConnection.collection("bbsettings");
    const name = c.req.param("name");
    const result = await settingsCollection.findOne({ Name: name });
    if (result) {
      return c.json(result, 200);
    }
    return c.json({ success: false, message: "Not found" }, 404);
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
