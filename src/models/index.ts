import * as Realm from "realm-web";

export const ObjectId = Realm.BSON.ObjectID;

export interface Permissions {
  addProduct: boolean;
  editProduct: boolean;
  deleteProduct: boolean;
  addQR: boolean;
  editQR: boolean;
  deleteQR: boolean;
}

export interface User {
  Type: "superadmin" | "admin" | "user";
  FirstName: string;
  LastName: string;
  Region: string;
  Avatar: string;
  Email: string;
  Password: string;
  Phone: string;
  Permissions: Permissions;
  Company: Realm.BSON.ObjectID | null;
  UserType: "general" | "govt" | "manufacturer" | "importer";
  APIKEY:string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  Name: string;
  Email: string;
  Logo: string;
  Plan: Realm.BSON.ObjectID | null;
  StripeId:string;
  StripeSubId:string;
  IsExpired:boolean;
  ExpiresAt:Date;
  QRCodeLimit: number;
  ProductLimit: number;
  IsPaid: boolean;
  SubscriptionExpireAt: Date;
  ApiKey: string | null;
  ApiKeyFor: [];
  EnableSmsVerification: boolean;
  SmsApi: string;
  SmsLimit: number;
  createdAt: Date;
  updatedAt: Date;

}

export interface Product {
  EnableQR: boolean;
  EnableSMS: boolean;
  EnablePTT: boolean;
  EnableGDC: boolean;
  QrGenerated: boolean;
  QrSerialPrefix: string;
  QrMaxLeadingZero: number;
  Quantity: number;
  Name: string;
  Description: string;
  GovtApprovalNo: string;
  Barcode: string;
  BatchNo: string;
  ManufactureAt: Date | null;
  ExpireAt: Date | null;
  Properties: [];
  Image: string;
  GS1NumberFrom: number | null;
  GS1NumberTo: number | null;
  ShipmentTrackingNo: string;
  ShipmentRouteFrom: string;
  ShipmentRouteTo: string;
  ShippersAddress: string;
  DestinationAddress: string;
  NumberOfPallets: number | null;
  NumberOfBoxes: number | null;
  ModeOfTransport: "Sea" | "Air" | "Road";
  LocalDistributorName: string;
  LocalDistributorAddress: string;
  LocalDistributorContactPerson: string;
  LocalDistributorPhone: string;
  LocalDistributorEmail: string;
  CouponButtons: [];
  Company: Realm.BSON.ObjectID | null;
  Owner: Realm.BSON.ObjectID | null;
  CouponQuestions: [];
  createdAt: Date;
  updatedAt: Date;
}

export interface QrCode {
  Product: Realm.BSON.ObjectID | null;
  Serial: string;
  SerialNumber: number;
  Label: string;
  Identifier: string | null;
  PIN: string;
  Company: Realm.BSON.ObjectID | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BBSetting {
  Name: string;
  Value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  Company: Realm.BSON.ObjectID | null;
  Name: string;
  Address: string;
  Email: string;
  Type: "manufacture" | "importer" | "distributor" | "pharmacy";
  PaymentVerificationNumber: string;
  RegistrationNo: string;
  LicesnseImage: string;
  City: string;
  Country: string;
  ContactPerson: string;
  Phone: string;
  Mobile: string;
  IsApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface DataPoint {
  QrCode: Realm.BSON.ObjectID | null;
  Product: Realm.BSON.ObjectID | null;
  GoogleLocationObject: [];
  OpenCageObject: [];
  Device: string;
  Longitude: string;
  Latitude: string;
  ScreenSize: string;
  OS: string;
  Language: string;
  BrowserFingerprint: string;
  FormFactor: string;
  winnerContact: string;
  VisitCompleted: boolean;
  Verified: boolean;
  winner: boolean;
  winningAction: boolean;
  Answers:[],
  createdAt: Date;
  updatedAt: Date;
}


export interface Payment {
  Company: Realm.BSON.ObjectID | null;
  PaymentFor: string;
  Description: string;
  Amount: number;
  WebhookData: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  Title: string;
  QRCodeLimit: number;
  CampaignLimit: number;
  Price: number;
  ScanValidity: number;
  Interval: "monthly" | "quarterly" | "bi-annually" | "annually";
  CustomIntervalStartDate: Date;
  CustomIntervalEndDate: Date;
  PlanType: "default" | "lite" | "professional" | "agency" | "printers";
  StripePlanId: string;
  IsActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  Title: string;
  QRCodeLimit: number;
  CampaignLimit: number;
  Price: number;
  ScanValidity: number;
  Interval: "monthly" | "quarterly" | "bi-annually" | "annually";
  CustomIntervalStartDate: Date;
  CustomIntervalEndDate: Date;
  PlanType: "default" | "lite" | "professional" | "agency" | "printers";
  StripePlanId: string;
  IsActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionSchedule{
  SubExpireAt:Date;
  Company: Realm.BSON.ObjectID | null;
  Plan: Realm.BSON.ObjectID | null;
  StripePlanId:string;
  ScheduledMigration:boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TopUp{
  Title:string;
  QrCode:number;
  SMS:number;
  Product:number;
  Active:boolean;
  createdAt: Date;
  updatedAt: Date;
}

