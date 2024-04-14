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
const ws            =       require('ws');                              // WebSocket Server

// Transport Library
class Transport{
    // Constructor
    constructor(){

    }

    // Setup Transport
    Setup(app){

    }
}

// Export Transport Instance
let transportInstance = new Transport();
module.exports = transportInstance;