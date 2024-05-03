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
const { Sequelize, DataTypes } =       require('sequelize');            // Require Sequelize Library

// Database Instance
let db = null;
let models = {};

// Data Layer Library
class DataLayer {
    // Try to Connect with Database
    static async Connect(){
        // Create Database Instance
        if(db != null) return;
        db = new Sequelize(`${Config?.DataLayer?.Type}://${Config?.DataLayer?.Login}:${Config?.DataLayer?.Password}@${Config?.DataLayer?.Host}:${Config?.DataLayer?.Port}/${Config?.DataLayer?.Database}`);

        try {
            await db.authenticate();
            Debug.Log("Connection has been established successfully.");
        } catch (error) {
            Debug.LogError(`Unable to connect to the database: ${error}`);
        }

        return db;
    }

    // Load Model
    static LoadModel(name, path){
        // Check Model Exitsts
        if(models.hasOwnProperty(name)){
            return models[name];
        }

        // Load model at Cache
        try{
            let baseModel = require(path);
            models[name] = baseModel(db, Sequelize, DataTypes);
            models[name].sync();
    
            return models[name];
        }catch(error){
            Debug.LogError(`Failed to load model \"${name}\". Error: \"${error}\"`);
            return;
        }
    }

    // Get Model by Name
    static GetModel(name){
        // Check Model Exitsts
        if(models.hasOwnProperty(name)){
            return models[name];
        }

        return null;
    }

    // Sync All Required Models
    static async Sync(){
        if(!db){
            throw new Error(`Failed to Sync Databases. Database Instance is not found`);
        }

        db.sync().then(function() {
            Debug.Log(`All databases sync complete`);
        }).catch(function(err) {
            Debug.LogError(`Failed to Sync Database ${err}`);
        });
    }
}

// Export Data Layer
module.exports = DataLayer;