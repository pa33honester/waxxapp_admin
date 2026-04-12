// Copy this file to setting.js on the server and fill in real API keys.
// This file is the initial seed for app settings stored in MongoDB.
// The app overwrites setting.js whenever an admin saves settings via the UI.
// Never commit setting.js to git.

module.exports = {
  "addressProof": { "isActive": true, "isRequired": true },
  "govId": { "isActive": true, "isRequired": true },
  "registrationCert": { "isActive": true, "isRequired": true },
  "currency": {
    "name": "Cedis",
    "symbol": "GH₵",
    "countryCode": "GH",
    "currencyCode": "GH₵",
    "isDefault": true
  },
  "_id": "6436376738292b4945610771",
  "withdrawCharges": 10,
  "withdrawLimit": 1000,
  "cancelOrderCharges": 1,
  "adminCommissionCharges": 1,
  "minPayout": 1,
  "paymentReminderForLiveAuction": 2,
  "paymentReminderForManualAuction": 2,
  "isAddProductRequest": true,
  "isUpdateProductRequest": true,
  "isFakeData": false,
  "isCashOnDelivery": true,

  // Payment gateways — replace with real keys
  "razorPaySwitch": false,
  "razorPayId": "YOUR_RAZORPAY_KEY_ID",
  "razorSecretKey": "YOUR_RAZORPAY_SECRET_KEY",

  "stripeSwitch": false,
  "stripePublishableKey": "YOUR_STRIPE_PUBLISHABLE_KEY",
  "stripeSecretKey": "YOUR_STRIPE_SECRET_KEY",

  "flutterWaveSwitch": false,
  "flutterWaveId": "YOUR_FLUTTERWAVE_PUBLIC_KEY",

  // Email — Resend API key
  "resendApiKey": "YOUR_RESEND_API_KEY",

  // Live streaming — Zego
  "zegoAppId": "YOUR_ZEGO_APP_ID",
  "zegoAppSignIn": "YOUR_ZEGO_APP_SIGN",

  // OpenAI (optional)
  "openaiApiKey": "YOUR_OPENAI_API_KEY",

  // Firebase service account — paste full JSON object from Firebase console
  // Project Settings → Service Accounts → Generate new private key
  "privateKey": {
    "type": "service_account",
    "project_id": "YOUR_FIREBASE_PROJECT_ID",
    "private_key_id": "YOUR_PRIVATE_KEY_ID",
    "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xxxxx@YOUR_PROJECT.iam.gserviceaccount.com",
    "client_id": "YOUR_CLIENT_ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "YOUR_CLIENT_CERT_URL",
    "universe_domain": "googleapis.com"
  },

  "privacyPolicyLink": "<p>Update via admin panel.</p>",
  "privacyPolicyText": "Privacy Policy Text",
  "termsAndConditionsLink": "<p>Update via admin panel.</p>"
};
