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
const passport      =       require('passport');                        // Require Passport Library
const session       =       require('cookie-session');                  // Express session
const helmet        =       require('helmet');                          // Helmet Security
const hbs           =       require('express-hbs');                     // Require Handlebars Renderer

//  Define Constants
global.ROOT_DIR     =       path.join(__dirname, "");                   // Root Directory
global.CORE_DIR     =       path.join(ROOT_DIR, "/server/core");        // Core Directory
global.MDW_DIR      =       path.join(ROOT_DIR, "/server/middlewares"); // Middlewares Directory
global.APP_DIR      =       path.join(ROOT_DIR, "/server/application"); // Application Directory
global.LOG_DIR      =       path.join(ROOT_DIR, "/logs");               // Logs Directory
global.STATIC_DIR   =       path.join(ROOT_DIR, "/static");             // Static Directory
global.VIEWS_DIR    =       path.join(ROOT_DIR, "/views");              // Setup Views Directory

//  Load Configuration and Debug
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const Debug         =       require(`${CORE_DIR}/debug`);               // Require Debug Library
const Transport     =       require(`${CORE_DIR}/transport`);           // Require Transport Library
const DataLayer     =       require(`${CORE_DIR}/datalayer`);           // Require Data Layer
const Router        =       require(`${CORE_DIR}/router`);              // Require Router Library

// Log Current Environment
Debug.Log(`Application Initialization at environment \"${Config?.Environment}\"`);

// Trying to Connect with Database
DataLayer.Connect().then(async db => {
    // Initialize Data-layers Models
    await DataLayer.Sync();

    //  Require Express and Middlewares
    const app           =       express();                                  // Create Express Application
    app.use(helmet());                                                      // Use Helmet Library
    app.use(express.urlencoded({ extended: true }));                        // Use URL Encoded
    app.use(express.json());                                                // Use JSON
    app.use(session({                                                       // Use Express Session
        keys: [Config?.Security?.DeveloperKey ?? "AH*XDT218gsADV"],         // Setup Developer Key for Sessions
        maxAge: 172800,
        domain: Config?.Application?.Domain ?? "localhost",
        secure: true,
        httpOnly: true,
        signed: true
    }));
    app.use(Transport.AddToMiddleware);                                     // Add Transport Instance Middleware (req.transport)
    app.use(passport.initialize());                                         // Use Passport Initialization
    app.use(passport.session());                                            // Use Passport Session
    app.disable('x-powered-by');

    //  Setup Render Engine
    app.engine('hbs', hbs.express4({
        partialsDir: `${VIEWS_DIR}/common/_partials`,
        layoutsDir: `${VIEWS_DIR}/common/_layouts`
    }));
    app.set('view engine', 'hbs');
    app.set('views', VIEWS_DIR);

    //  Setup Routing
    app.use(express.static('static'));                                      // Add Static Routes
    Router.CollectRoutes(app);                                              // Collect Routes for Application

    //  Setup Transport
    Transport.Setup(app);
}).catch(error => {
    Debug.LogError(error);
});