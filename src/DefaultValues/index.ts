import { User, Company, Permissions, Product, QrCode, DataPoint, Business, Payment, Plan, SubscriptionSchedule, TopUp } from "../models";

export const PermissionsDefaultValues: Permissions = {
  addProduct: false,
  editProduct: false,
  deleteProduct: false,
  addQR: false,
  editQR: false,
  deleteQR: false,
};

export const UserDefaultValues: User = {
  Type: "user",
  FirstName: "",
  LastName: "",
  Region: "",
  Avatar: "",
  Email: "",
  Password: "",
  Phone: "",
  Permissions: PermissionsDefaultValues,
  Company: null,
  UserType: "general",
  APIKEY:"",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const CompanyDefaultValues: Company = {
  Name: "",
  Email: "",
  Logo: "",
  Plan: null,
  StripeId: "",
  StripeSubId: "",
  IsExpired: false,
  ExpiresAt: new Date(),
  QRCodeLimit: 0,
  ProductLimit: 0,
  IsPaid: false,
  SubscriptionExpireAt: new Date(),
  ApiKey: null,
  ApiKeyFor: [],
  EnableSmsVerification: false,
  SmsApi: "",
  SmsLimit: 0,
  createdAt: new Date(),
  updatedAt: new Date(),

};

export const ProductDefaultValue: Product = {
  EnableQR: true,
  EnableSMS: false,
  EnablePTT: false,
  EnableGDC: false,
  QrGenerated: false,
  QrSerialPrefix: "",
  QrMaxLeadingZero: 0,
  Quantity: 0,
  Name: "",
  Description: "",
  GovtApprovalNo: "",
  Barcode: "",
  BatchNo: "",
  ManufactureAt: null,
  ExpireAt: null,
  Properties: [],
  Image: "",
  GS1NumberFrom: null,
  GS1NumberTo: null,
  ShipmentTrackingNo: "",
  ShipmentRouteFrom: "",
  ShipmentRouteTo: "",
  ShippersAddress: "",
  DestinationAddress: "",
  NumberOfPallets: null,
  NumberOfBoxes: null,
  ModeOfTransport: "Sea",
  LocalDistributorName: "",
  LocalDistributorAddress: "",
  LocalDistributorContactPerson: "",
  LocalDistributorPhone: "",
  LocalDistributorEmail: "",
  CouponButtons: [],
  Company: null,
  CouponQuestions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  Owner: null,
};


export const QrCodeDefaultValue: QrCode = {
  Product: null,
  Serial: "",
  SerialNumber:0,
  Label: "",
  Identifier: "",
  PIN: "",
  Company:null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const BusinessDefaultValue: Business = {
  Company: null,
  Name: "",
  Address: "",
  Email: "",
  Type: "manufacture",
  PaymentVerificationNumber: "",
  RegistrationNo: "",
  LicesnseImage: "",
  City: "",
  Country: "",
  ContactPerson: "",
  Phone: "",
  Mobile: "",
  IsApproved: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};


export const DataPointDefaultValue: DataPoint = {
  QrCode: null,
  Product: null,
  GoogleLocationObject: [],
  OpenCageObject: [],
  Device: "",
  Longitude: "",
  Latitude: "",
  ScreenSize: "",
  OS: "",
  Language: "",
  BrowserFingerprint: "",
  FormFactor: "",
  winnerContact: "",
  VisitCompleted: false,
  Verified: false,
  winner: false,
  winningAction: false,
  Answers:[],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const PaymentDefaultValue: Payment = {
  PaymentFor:"",
  Description:"",
  Company:null,
  Amount:0,
  WebhookData:{},
  createdAt: new Date(),
  updatedAt: new Date(),
}


export const PlanDefaultValue: Plan = {
  Title: "",
  QRCodeLimit: 0,
  CampaignLimit: 0,
  Price: 0,
  ScanValidity: 0,
  Interval: "monthly",
  CustomIntervalStartDate: new Date(),
  CustomIntervalEndDate: new Date(),
  PlanType: "default",
  StripePlanId: "",
  IsActive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const SubscriptionScheduleDefaultValue: SubscriptionSchedule = {
  SubExpireAt: new Date(),
  Company: null,
  Plan: null,
  StripePlanId:"",
  ScheduledMigration:false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const TopupDefaultValue: TopUp = {
  Title:"",
  QrCode:0,
  SMS:0,
  Product:0,
  Active:false,
  createdAt: new Date(),
  updatedAt: new Date(),
}



