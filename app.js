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

//  Define Constants
global.ROOT_DIR     =       path.join(__dirname, "");                   // Root Directory
global.CORE_DIR     =       path.join(ROOT_DIR, "/server/core");        // Core Directory
global.MDW_DIR      =       path.join(ROOT_DIR, "/server/middlewares"); // Middlewares Directory
global.APP_DIR      =       path.join(ROOT_DIR, "/server/application"); // Application Directory
global.LOG_DIR      =       path.join(ROOT_DIR, "/logs");               // Logs Directory
global.CLIENT_DIR   =       path.join(ROOT_DIR, "/client");             // Client Directory
global.STATIC_DIR   =       path.join(ROOT_DIR, "/static");             // Static Directory

//  Load Configuration and Debug
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const Debug         =       require(`${CORE_DIR}/debug`);               // Require Debug Library
const Transport     =       require(`${CORE_DIR}/transport`);           // Require Transport Library

// Log Current Environment
Debug.Log(`Application Initialization at environment \"${Config?.Environment}\"`);

//  Require Express and Middlewares
const app           =       express();                                  // Create Express Application
app.use(Transport.AddToMiddleware);                                     // Add Transport Instance Middleware (req.transport)

//  Setup Routing
app.use(express.static('static'));                                      // Add Static Routes
app.use(express.static('client'));                                      // Add Client Static Routes

//  Setup Transport
Transport.Setup(app);