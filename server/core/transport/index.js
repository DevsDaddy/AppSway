//=================================================================
//  AppSway Transport Library
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
//  Require Nessessary Libraries
const path          =       require('path');                            // Path Library
const fs            =       require('fs');                              // File System
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const http          =       require('http');                            // HTTP Server
const https         =       require('https');                           // HTTPs Server
const ws            =       require('ws');                              // Setup WebSocket Server
const Debug         =       require(`${CORE_DIR}/debug`);               // Require Debug Library

// Transport Library
class Transport{
    // Constructor
    constructor(){
        this.isRunned = false;
        this.credentials = null;
        this.certificates = null;
        this.httpServer = null;
        this.httpsServer = null;
        this.relayServer = null;

        this.onRelayConnected = function(){};
        this.onRelayMessage = function(data, isBinary){};
        this.onRelayError = function(error){};

        this.app = null;
        this.GetCredentials();
    }

    // Setup Transport
    Setup(app){
        this.app = app;
        this.RunHTTP(port=>{
            Debug.Log(`HTTP Transport is completely started at ${port} port`);
        });
        this.RunSSL(port=>{
            Debug.Log(`HTTPs Transport is completely started at ${port} port`);
        });
        this.StartRelay(port=>{
            Debug.Log(`WebSocket Relay Transport is completely started at ${port} port`);
        })
        this.isRunned = true;
    }

    // Run HTTP Server
    RunHTTP(callback){
        let port = Config?.Transport?.HttpPort ?? 80;
        this.httpServer = http.createServer(this.app);
        this.httpServer.listen(port, ()=>{
            callback(port);
        });
    }

    // Run HTTPs Server
    RunSSL(callback){
        let port = Config?.Transport?.SslPort ?? 443;
        this.httpsServer = https.createServer(this.credentials, this.app);
        this.httpsServer.listen(port, ()=>{
            callback(port);
        });
    }

    // Setup Middleware for Application
    AddToMiddleware(req, res, next){
        req.transport = this;
        next();
    }

    // Start Server Relay
    StartRelay(onConnected = null, onMessage = null, onError = null){
        // Start over HTTP or HTTPs
        let self = this;
        let port = Config?.Transport?.WebSocketPort ?? 8443;
        if(self.relayServer != null) return self.relayServer;

        // Add Handlers
        if(onConnected !== undefined && onConnected != null && typeof onConnected == "function") self.onRelayConnected = onConnected;
        if(onMessage !== undefined && onMessage != null && typeof onMessage == "function") self.onRelayMessage = onMessage;
        if(onError !== undefined && onError != null && typeof onError == "function") self.onRelayError = onError;

        // Start Relay
        self.relayServer = new ws.WebSocketServer({ port: port });
        self.relayServer.on('connection', function connection(ws) {
            ws.on('error', error => {
                Debug.LogError("Relay Server Connection Error: " + error);
                self.onRelayError(error);
            });
          
            ws.on('message', function message(data, isBinary) {
                self.onRelayMessage(data, isBinary);
                self.relayServer.clients.forEach(function each(client) {
                  if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(data, { binary: isBinary });
                  }
                });
            });
            
            self.onRelayConnected();
        });
    }

    // Get SSL Credentials
    GetCredentials(){
        // Generate Objects
        this.certificates = { cert: null, public: null, private: null };
        this.credentials = { cert: null, key: null };

        // Get Path Names
        let certpath = Config?.Transport?.CertificatesPath ?? `${ROOT_DIR}/server/certificates`;
        let names = { cert: Config?.Transport?.SSLCertName ?? "certificate.cert", public: Config?.Transport?.PublicKeyName ?? "public.key", private: Config?.Transport?.PrivateKeyName ?? "private.key" };
        
        // Load Base Certificates and Names
        if(fs.existsSync(path.join(certpath, `${names.cert}/`))) this.certificates.cert = fs.readFileSync(path.join(certpath, `${names.cert}/`));
        if(fs.existsSync(path.join(certpath, `${names.private}/`))) this.certificates.private = fs.readFileSync(path.join(certpath, `${names.private}/`));
        if(fs.existsSync(path.join(certpath, `${names.public}/`))) this.certificates.public = fs.readFileSync(path.join(certpath, `${names.public}/`));

        // Set Credentials
        if(!this.certificates && this.certificates.cert != null && this.certificates.cert.length > 0 && typeof this.certificates.cert == "string"){
            this.credentials.cert = this.certificates.cert
        }else{
            Debug.LogWarning(`Failed to get certificate for Transport class. Certificate \"${path.join(certpath, `${names.cert}/`)}\" is not found or empty.`);
        }

        if(!this.certificates && this.certificates.public != null && this.certificates.public.length > 0 && typeof this.certificates.public == "string"){
            this.credentials.key = this.certificates.public
        }else{
            Debug.LogWarning(`Failed to get public key for Transport class. Public key \"${path.join(certpath, `${names.public}/`)}\" is not found or empty.`);
        }

        // Return Credentials
        return this.credentials;
    }
}

// Export Transport Instance
let transportInstance = new Transport();
module.exports = transportInstance;