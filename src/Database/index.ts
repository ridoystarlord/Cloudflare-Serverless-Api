import * as Realm from "realm-web";

export const databaseConnection = async (
  REALM_APPID: string,
  REALM_API_KEY: string
) => {
  let App: Realm.App = new Realm.App(REALM_APPID);
  let client: globalThis.Realm.Services.MongoDB;
  let dbConnection: globalThis.Realm.Services.MongoDBDatabase;
  try {
    const credentials = Realm.Credentials.apiKey(REALM_API_KEY);
    var user = await App.logIn(credentials);
    client = user.mongoClient("mongodb-atlas");
    dbConnection = client.db("bbe_db");
    return { error: false, dbConnection, message: "" };
  } catch (err) {
    return { error: true, dbConnection: null, message: err };
  }
};

//   let App: Realm.App = new Realm.App(c.env.REALM_APPID);
//   let user, client;
//   try {
//     const credentials = Realm.Credentials.apiKey(c.env.REALM_API_KEY);
//     user = await App.logIn(credentials);
//     client = user.mongoClient("mongodb-atlas");
//   } catch (err) {
//     return c.json({ error: err });
//   }
//   const dbConnection = client.db("bbe_db");
