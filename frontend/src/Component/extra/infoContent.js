// Storage Setting
export const digitalOceanContent = [
    {
        label: "Endpoint",
        description: "Tells your app where to connect to your Space for uploads/downloads.",
    },
    {
        label: "Host Name",
        description: "Defines the base URL for serving files from your Space region.",
    },
    {
        label: "Secret Key",
        description: "Secures access to your files. Keep this private.",
    },
    {
        label: "Access Key",
        description: "Works with Secret Key to authenticate file requests.",
    },
    {
        label: "Bucket Name",
        description: "Specifies which Space stores your uploaded files.",
    },
    {
        label: "Region",
        description: "Decides the data center (e.g., blr1) — affects speed and latency.",
    },
];

export const awsContent = [
    {
        label: "Endpoint",
        description: "Connects your app to AWS S3 for file storage.",
    },
    {
        label: "Host Name",
        description: "Used to generate URLs for accessing stored files.",
    },
    {
        label: "Access Key",
        description: "Identifies your AWS account when making storage requests.",
    },
    {
        label: "Secret Key",
        description: "Secures those requests. Keep this hidden.",
    },
    {
        label: "Bucket Name",
        description: "Defines which S3 bucket your files are stored in.",
    },
    {
        label: "Region",
        description: "Specifies bucket’s location (e.g., ap-south-1). Impacts latency & costs.",
    },
];

export const storageOptionContent = [
    {
        label: "Local",
        description: "Stores files on your own server. Easy setup but limited space.",
    },
    {
        label: "AWS S3",
        description: "Scalable storage from Amazon. Best for large-scale apps.",
    },
    {
        label: "DigitalOcean Space",
        description: "Affordable S3-compatible storage. Good for small to medium apps.",
    },
];


// Payment Setting 
export const razorpayContent = [
    {
        label: "Razorpay",
        description: "Toggle to enable or disable Razorpay as a payment method.",
    },
    {
        label: "Razorpay Id",
        description: (
            <>
                Public Key ID for Razorpay integration.{" "}
                <a
                    href="https://dashboard.razorpay.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Get it from Razorpay Dashboard
                </a>
            </>
        ),
    },
    {
        label: "Razorpay Secret Key",
        description: (
            <>
                Secret API key paired with the Key ID for secure transactions.{" "}
                <a
                    href="https://dashboard.razorpay.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Manage it in Razorpay Dashboard
                </a>
            </>
        ),
    },
];

export const stripeContent = [
    {
        label: "Stripe",
        description: "Toggle to enable or disable Stripe as a payment method.",
    },
    {
        label: "Stripe Publishable Key",
        description: (
            <>
                Public API key for Stripe payments. Required for client-side requests.{" "}
                <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Get it from Stripe Dashboard
                </a>
            </>
        ),
    },
    {
        label: "Stripe Secret Key",
        description: (
            <>
                Secret API key for server-side requests. Keep this key private.{" "}
                <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Manage it in Stripe Dashboard
                </a>
            </>
        ),
    },
];

export const googlePlayContent = [
    {
        label: "Google Play",
        description: (
            <>
                Toggle to enable or disable Google Play billing for in-app purchases.{" "}
                <a
                    href="https://developer.android.com/google/play/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Learn more at Google Play Billing Docs
                </a>
            </>
        ),
    },
];

export const flutterWaveContent = [
    {
        label: "Flutterwave",
        description: "Enable or disable Flutterwave as a payment method.",
    },
    {
        label: "Flutterwave ID",
        description: (
            <>
                API key for Flutterwave integration.{" "}
                <a
                    href="https://dashboard.flutterwave.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                    Get it from Flutterwave Dashboard
                </a>
            </>
        ),
    },
];

// Ads Setting
export const androidAdsContent = [
    {
        label: "Android Google Reward",
        description: "Ad unit ID for rewarded ads on Android (users watch ads to earn rewards).",
    },
    {
        label: "Android Google Native",
        description: "Ad unit ID for native ads on Android (blend into app content).",
    },
];

export const iosAdsContent = [
    {
        label: "iOS Google Reward",
        description: "Ad unit ID for rewarded ads on iOS (users watch ads to earn rewards).",
    },
    {
        label: "iOS Google Native",
        description: "Ad unit ID for native ads on iOS (seamlessly integrated with UI).",
    },
];

// General Setting
export const supportEmailSetting = [
    {
        label: "Support Email",
        description: "Email where users can contact support or get system messages.",
    }
]

export const resendApiSetting = [
    {
        label: "Resend API Key",
        description: (
            <>
                Key for Resend service to send OTPs, resets, and emails.{' '}
                <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                >
                    Get it from Resend Dashboard
                </a>
                .
            </>
        ),
    }
]


export const zegoApp = [

    {
        label: "Zego App ID",
        description: (
            <>
                Zego App ID for video and live streaming services.
            </>
        ),
    },
    {
        label: "Zego App Sign",
        description: (
            <>
                Zego App Sign for secure connection. You can get it from Zego Console{' '}
                <a
                    href="https://dashboard.razorpay.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0d6efd", textDecoration: "underline" }}
                >
                      Click  
                </a>
                .
            </>
        ),
    },
];

export const chargesSetting = [
    {
        label: "Cancel Order Charges (%)",
        description: (
            <>
                Percentage charge applied whenever an order is canceled.
                This represents the deduction on cancelled orders.
            </>
        ),
    },
    {
        label: "Admin Commission Charges (%)",
        description: (
            <>
                Percentage of commission the admin receives from each order.
                This is the share of the total order value earned by the admin.
            </>
        ),
    },
];

export const auctionSetting = [
    {
        label: "Payment Reminder For LiveAuction (In Minutes)",
        description: (
            <>
                The interval in minutes after which a payment reminder will be sent for Live Auctions.
                Set the reminder time to notify users to complete payment for LiveAuction wins.
            </>
        ),
    },
    {
        label: "Payment Reminder For ManualAuction (In Minutes)",
        description: (
            <>
                The interval in minutes after which a payment reminder will be sent for Manual Auctions.
                Use this to set how soon participants are reminded to make payment for ManualAuction wins.
            </>
        ),
    },
];

export const withdrawalSetting = [
    {
        label: "Minimum Withdrawal Amount",
        description: (
            <>
                The minimum amount a seller must have in their balance before they can request a withdrawal.
                This ensures withdrawals are processed only when the balance meets or exceeds this limit (in USD).
            </>
        ),
    },
];

export const openAISetting = [
    {
        label: "Open AI Key",
        description: (
            <>
                Enter your OpenAI API key here.
                This key is required to access OpenAI's services for features such as AI-powered text generation or analysis.
            </>
        ),
    },
];

export const privateKeyJson = [
    {
        label: "Firebase Notification Settings",
        description: (
            <>
                Configure Firebase Cloud Messaging (FCM) to send push notifications.You can get the private key JSON file from
                your Firebase project settings.{' '}
                <a
                    href='https://console.firebase.google.com/project'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-500'
                >
                    Click
                </a>
                .
            </>
        ),
    },
];






