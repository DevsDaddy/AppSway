//=================================================================
//  AppSway Configuration
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
//  Require Nessessary Libraries
require('dotenv').config();                                             // DotEnv Configurations


const Config = {
    Environment: process.env.ENV ?? "development",      // Environment Mode ("development", "testing", "production")
    Application: {
        Name: process.env.APP_NAME ?? "App Sway",
        Description: process.env.APP_DESC ?? "This is the demo application based on App Sway",
        Domain: process.env.APP_DOMAIN ?? "localhost",
        Author: process.env.APP_AUTHOR ?? "DevsDaddy"
    },
    Debug: {
        LogLevel: process.env.LOG_LEVEL ?? "all",           // Logging Level ("all", "infos", "warnings", "errors")
        FileLog: true,                                      // File Logging
    },
    Security: {
        DeveloperKey: process.env.DEVELOPER_KEY ?? "ja8S5Our4wvoMHy7pN1oDQYFkY7ww7fD",   // Developer Key
    },
    Transport: {
        CertificatesPath: `${ROOT_DIR}/server/certificates`,        // Certificate Path
        SSLCertName: 'certificate.cert',                            // SSL Ceritiface Name
        PublicKeyName: 'public.key',                                // SSL Public Key Name
        PrivateKeyName: 'private.key',                              // SSL Private Key Name
        HttpPort: process.env.HTTP_PORT ?? 80,                      // HTTP Port
        SslPort: process.env.SSL_PORT ?? 443,                       // HTTPs Port
        WebSocketPort: process.env.WS_PORT ?? 8443,                 // WebSocket Port
        StartRelay: true                                            // Start Relay Port
    },
    DataLayer: {
        Database: process.env.DB_NAME ?? "app_sway",                // Database Name
        Login: process.env.DB_LOGIN ?? "login",                     // Database Login
        Password: process.env.DB_PASSWORD ?? "password",            // Database Password
        Host: process.env.DB_HOST ?? "localhost",                   // Database Host
        Port: process.env.DB_PORT ?? 3306,                          // Database Port
        Type: process.env.DB_TYPE ?? "mysql"                        // Database Type
    },
    Authentication: {
        GuestLogin: true,                       // Accept Application Guest Login
        ConfirmEmails: true,                    // Confirm Emails via Email code
        GuestLifetime: 12,                      // Guest Accounts Lifetime in months
        
    },
    Nodemailer: {
        from: process.env.SMTP_FROM ?? "AppSway <hello@asway.tech>",
        host: process.env.SMTP_HOST ?? "smtp.ethereal.email",
        port: process.env.SMTP_PORT ?? 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER ?? "norene.greenholt@ethereal.email",
            pass: process.env.SMTP_PASSWORD ?? "4eThUFWwDf7bZV5Nc4",
        },
    }
};

// Export Config
module.exports = Config;