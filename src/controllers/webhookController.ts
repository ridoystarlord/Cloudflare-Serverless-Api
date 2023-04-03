import { Context } from "hono";
import { databaseConnection } from "../Database";
import { getAuthUserId } from "../utils";

export const whatsAppVerification = async (c: Context) => {
  let db = databaseConnection(c.env.REALM_APPID, c.env.REALM_API_KEY);
  const databaseConnectionResponse = await db;
  if (
    !databaseConnectionResponse.error &&
    databaseConnectionResponse.dbConnection
  ) {
    const qrCodeCollection =
      databaseConnectionResponse.dbConnection.collection("qrcodes");
    const body = await c.req.json();
    const { data } = body;
    const response = await qrCodeCollection.findOne({ PIN: data.body });
    let whatsAppDataFormat = {};
    //@ts-expect-error
    whatsAppDataFormat.method = req.method;
    //@ts-expect-error
    whatsAppDataFormat.url = "https://api.wassenger.com/v1/messages";
    //@ts-expect-error
    whatsAppDataFormat.headers = {
      token:
        "635d57279b7a5b704fb4dc0dfd9eaecfc78eef27f99da24288c6b9fef330f2c44d02b5e01a3ccc4f",
      "content-type": "application/json",
    };
    if (response) {
      const product = response.Product;
      //@ts-expect-error
      whatsAppDataFormat.body = {
        message: product.Name,
        phone: data.fromNumber,
        // other info
      };
      try {
        if (whatsAppDataFormat) {
          //@ts-expect-error
          let webResponse = await fetch(whatsAppDataFormat);
          if (webResponse) {
            return c.json({ success: true });
          }
          return c.json("Something went Wrong");
        }
      } catch (error) {
        return c.json(error);
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
