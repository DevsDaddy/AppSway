//=================================================================
//  AppSway DataLayer Library
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
const { Sequelize } =       require('sequelize');                       // Require Sequelize Library

// Data Layer Library
class DataLayer {
    // Create Database Connection
    constructor(){
        this.db = null;
    }

    // Try to Connect with Database
    async Connect(){
        // Create Database Instance
        if(this.db != null) return;
        this.db = new Sequelize(`${Config?.DataLayer?.Type}://${Config?.DataLayer?.Login}:${Config?.DataLayer?.Password}@${Config?.DataLayer?.Host}:${Config?.DataLayer?.Port}/${Config?.DataLayer?.Database}`);

        try {
            await this.db.authenticate();
            Debug.Log("Connection has been established successfully.");
        } catch (error) {
            Debug.LogError(`Unable to connect to the database: ${error}`);
        }

        return this.db;
    }

    // Load Application Models
    

    // Sync All Required Models
    async Sync(){
        if(!this.db){
            throw new Error(`Failed to Sync Databases. Database Instance is not found`);
        }

        this.db.sync().then(function() {
            Debug.Log(`All databases sync complete`);
        }).catch(function(err) {
            Debug.LogError(`Failed to Sync Database ${err}`);
        });
    }
}

let dataLayerInstance = new DataLayer();
module.exports = dataLayerInstance;