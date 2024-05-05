//=================================================================
//  AppSway Routing Library
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
//  Require Nessessary Libraries
const path          =       require('path');                            // Path Library
const fs            =       require('fs');                              // File System
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const Debug         =       require(`${CORE_DIR}/debug`);               // Require Debug Library

// Router Class
class Router {
    constructor(){
        this.app = null;
        this.routes = [];
        this.system_routes = [];
        this.addons = [];
    }

    // Collect Routes
    async CollectRoutes(app){
        let self = this;
        self.app = app;
        await this.SetupApplicationLocals();

        // Setup Safe Redirect
        self.app.use(self.SetupFromRequest);
        self.app.use(self.SetupSafeRedirect);
        self.app.use(self.SetupSeparatedResponse);

        // Collect Addons
        fs.readdirSync(`${ADDONS_DIR}`, { withFileTypes: true }).filter(function (dirent) {
            return dirent.isDirectory();
        }).map(dirent => dirent.name).forEach(addonName => {
            let modRoutes = path.join(CORE_DIR, `/${addonName}/index.js`);
            if(fs.existsSync(modRoutes)){
                let moduleRoutes = require(modRoutes);
                moduleRoutes.Init();
                self.addons.push(moduleRoutes);
            }
        });

        Debug.Log(`${self.addons.length} addons are initialized at application.`);

        // Collect Middlewares

        // Collect System Routes
        fs.readdirSync(`${CORE_DIR}`, { withFileTypes: true }).filter(function (dirent) {
            return dirent.isDirectory();
        }).map(dirent => dirent.name).forEach(moduleName => {
            let modRoutes = path.join(CORE_DIR, `/${moduleName}/routes.js`);
            if(fs.existsSync(modRoutes)){
                let moduleRoutes = require(modRoutes);
                self.app.use(`/${moduleName}/`, moduleRoutes);
                self.system_routes.push(moduleRoutes);
            }
        });

        Debug.Log(`${self.system_routes.length} system routes are initialized at application.`);

        // Collect All Routes
        fs.readdirSync(`${APP_DIR}`, { withFileTypes: true }).filter(function (dirent) {
            return dirent.isDirectory();
        }).map(dirent => dirent.name).forEach(moduleName => {
            let modRoutes = path.join(APP_DIR, `/${moduleName}/routes.js`);
            if(fs.existsSync(modRoutes)){
                let moduleRoutes = require(modRoutes);
                self.app.use(`/${moduleName}/`, moduleRoutes);
                self.routes.push(moduleRoutes);
            }
        });

        Debug.Log(`${self.routes.length} modules routes are initialized at application.`);

        // Last Routes are Errors
        self.app.use(self.NotFoundHandler);
        self.app.use(self.HandleErrors);
    }

    // Setup From Requests
    async SetupFromRequest(req, res, next){
        // No Redirect URL
        req.isAPI = true;

        // From Flag is Setup to Web
        if(req?.query?.from == "web" || req?.body?.from == "web"){
            req.isAPI = false;
            next();
            return;
        }

        next();
    }

    // Setup Separated Response
    async SetupSeparatedResponse(req, res, next){
        // Build Response
        res.build = function(isSuccess, message, data){
            if(req.isAPI){
                return res.json({ success: isSuccess, message: message, data: data });
            }else{
                let redirect = data.redirect ?? null;
                if(redirect == null){
                    if(isSuccess){
                        return res.render(data.template, data);
                    }else{
                        return res.status(500).render("system/error", {
                            title: 'Server Error',
                            message : message,
                            seo_description: message,
                            seo_robots: "noindex,nofollow",
                            stack: null,
                            code: 500
                        });
                    }
                }else{
                    if(isSuccess)
                        return res.redirect(`${data.redirect}`);
                    else
                        return res.redirect(`${data.redirect}?error=`+message);
                }
            }
        };

        next();
    }

    // Setup Safe Redirect
    async SetupSafeRedirect(req, res, next){
        // No Redirect URL
        if(!req || !req.query || !req.query.redirect){
            next();
            return;
        }

        let redirectBaseUrl = req.query.redirect;
        if(redirectBaseUrl.startsWith("/")){
            req.query.redirect = encodeURI(redirectBaseUrl);
            next();
            return;
        }
        
        try{
            // Check Setup of Base Domain
            if(!Config || !Config.Application || !Config.Application.Domain){
                req.query.redirect = "";
                next();
                return;
            }

            // Check Domain
            if (new URL(redirectBaseUrl).host !== Config.Application.Domain) {
                req.query.redirect = "";
                next();
                return;
            }

            // Allowed Redirect URI
            req.query.redirect = encodeURI(redirectBaseUrl);
            next();
            return;
        }catch(error){
            req.query.redirect = "";
            next();
            return;
        }
    }

    // Setup Application Locals
    async SetupApplicationLocals(){
        let self = this;
        self.app.locals.APP_NAME = Config?.Application?.Name ?? "App Sway";
        self.app.locals.APP_DOMAIN = Config?.Application?.Domain ?? "localhost";
        self.app.locals.APP_DESC = Config?.Application?.Description ?? "This is the demo application";
        self.app.locals.APP_AUTHOR = Config?.Application?.Author ?? "DevsDaddy";
    }

    // Not Found Handler
    async NotFoundHandler(req, res, next){
        let code = 404;
        let title = "Oops! Page Not Found";
        let message = "Unfortunately, we were unable to find the content you requested. It may have been removed or moved.";
        let stack = null;

        // API or Page Render
        if(req.method == "POST"){
            return res.status(404).json({ success: false, code: code, message: message, stack: stack });
        }else{
            return res.status(404).render("system/error", {
                title: title,
                message : message,
                seo_description: message,
                seo_robots: "noindex,nofollow",
                stack: stack,
                not_found: true,
                code: code
            });
        }
    }

    // Handle Errors
    async HandleErrors(err, req, res, next){
        let code = 500;
        let title = "Oops! Internal Server Error";
        let message = err?.message ?? "An unexpected server error occurred while the script was running. Try your request again later.";
        let stack = (Config?.Environment == "development") ? err?.stack ?? "No Stack Provided for this Error" : null;

        // API or Page Render
        if(req.method == "POST"){
            return res.status(500).json({ success: false, code: code, message: message, stack: stack });
        }else{
            return res.status(code).render("system/error", {
                title: title,
                message : message,
                seo_description: message,
                seo_robots: "noindex,nofollow",
                stack: stack,
                code: code
            });
        }
    }
}

// Create Router Instance and Export
let routerInstance = new Router();
module.exports = routerInstance;