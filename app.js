//=================================================================
//  AppSway Platform Bootstrap
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
//  Require Nessessary Libraries
const express       =       require('express');                         // Express Library
const path          =       require('path');                            // Path Library
const helmet        =       require('helmet');                          // Helmet Security
const hbs           =       require('express-hbs');                     // Require Handlebars Renderer
const session       =       require('express-session');                 // Require Express Session
const bodyParser    =       require('body-parser');                     // Require Body Parser
const i18next       =       require("i18next");                         // Localization Manager
const localeMiddleware =    require("i18next-http-middleware");         // Express Middleware for Localization
const localeBackend =       require('i18next-fs-backend');              // Localization Backend

//  Define Constants
global.ROOT_DIR     =       path.join(__dirname, "");                   // Root Directory
global.CORE_DIR     =       path.join(ROOT_DIR, "/server/core");        // Core Directory
global.MDW_DIR      =       path.join(ROOT_DIR, "/server/middlewares"); // Middlewares Directory
global.APP_DIR      =       path.join(ROOT_DIR, "/server/application"); // Application Directory
global.LOG_DIR      =       path.join(ROOT_DIR, "/logs");               // Logs Directory
global.STATIC_DIR   =       path.join(ROOT_DIR, "/static");             // Static Directory
global.VIEWS_DIR    =       path.join(ROOT_DIR, "/views");              // Setup Views Directory
global.ADDONS_DIR   =       path.join(ROOT_DIR, "/server/addons");      // Setup Addons Directory
global.LOCALE_DIR   =       path.join(ROOT_DIR, "/server/locale");      // Setup Locales Directory

//  Load Configuration and Debug
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const Debug         =       require(`${CORE_DIR}/debug`);               // Require Debug Library

// Load Core Libraries
const Transport     =       require(`${CORE_DIR}/transport`);           // Require Transport Library
const DataLayer     =       require(`${CORE_DIR}/datalayer`);           // Require Data Layer
const Router        =       require(`${CORE_DIR}/router`);              // Require Router Library
const Auth          =       require(`${CORE_DIR}/auth`);                // Require Authentication Layer Library
const HBSAddons     =       require(`${CORE_DIR}/utils/hbs`);           // Require HBS Addons

// Log Current Environment
Debug.Log(`Application Initialization at environment \"${Config?.Environment}\"`);

// Trying to Connect with Database
DataLayer.Connect().then(async db => {
    // Setup Authentication Library
    await Auth.SetupAuthentication();                                       // Setup Authentication Library

    //  Require Express and Middlewares
    const app           =       express();                                  // Create Express Application
    app.use(helmet());                                                      // Use Helmet Library
    app.use(express.urlencoded({ extended: true }));                        // Use URL Encoded
    app.use(express.json());                                                // Use JSON
    app.use(bodyParser.json());                                             // Use JSON Parser
    app.use(session({                                                       // Use Express Session
        secret: Config?.Security?.DeveloperKey ?? "AH*XDT218gsADV",
        saveUninitialized: false,
        resave: false,
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: 172800000
        }
    }));
    app.use(Transport.AddToMiddleware);                                     // Add Transport Instance Middleware (req.transport)
    app.disable('x-powered-by');                                            // Disable Powered-By

    // Setup Localization
    i18next.use(localeBackend).use(localeMiddleware.LanguageDetector)
    .init({
        backend: {
            loadPath: LOCALE_DIR + '/{{lng}}/{{ns}}.json',
        },
        detection: {
            order: ['querystring', 'cookie', 'session'],
            caches: ['cookie']
        },
        fallbackLng: 'en',
        preload: ['en', 'ru']
    });
    app.use(localeMiddleware.handle(i18next));

    //  Setup Render Engine
    app.engine('hbs', hbs.express4({
        partialsDir: `${VIEWS_DIR}/common/_partials`,
        layoutsDir: `${VIEWS_DIR}/common/_layouts`
    }));
    app.set('view engine', 'hbs');
    app.set('views', VIEWS_DIR);

    // Setup HBS Addons
    HBSAddons.Init(app, hbs);

    //  Setup Routing
    app.use(express.static('static'));                                      // Add Static Routes 
    Router.CollectRoutes(app, hbs);                                         // Collect Routes for Application

    //  Setup Transport
    Transport.Setup(app);
}).catch(error => {
    Debug.LogError(error);
});