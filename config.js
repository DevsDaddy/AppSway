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
    Debug: {
        LogLevel: process.env.LOG_LEVEL ?? "all",           // Logging Level ("all", "infos", "warnings", "errors")
        FileLog: true,                                      // File Logging
    },
    Security: {
        DeveloperKey: "ja8S5Our4wvoMHy7pN1oDQYFkY7ww7fD",   // Developer Key
    },
    Transport: {
        CertificatesPath: `${ROOT_DIR}/server/certificates`,
        SSLCertName: 'certificate.cert',
        PublicKeyName: 'public.key',
        PrivateKeyName: 'private.key',
        HttpPort: process.env.HTTP_PORT ?? 80,
        SslPort: process.env.SSL_PORT ?? 443,
        WebSocketPort: process.env.WS_PORT ?? 8080
    },
    DataLayer: {

    }
};

// Export Config
module.exports = Config;