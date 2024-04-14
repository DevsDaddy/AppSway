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
    }

    // Collect Routes
    async CollectRoutes(app){
        let self = this;
        self.app = app;
        await this.SetupApplicationLocals();

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
                description: message,
                seo_robots: "noindex,nofollow",
                stack: stack,
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
            return res.status(404).render("system/error", {
                title: title,
                message : message,
                description: message,
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