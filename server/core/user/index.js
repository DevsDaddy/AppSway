//=================================================================
//  AppSway User Layer
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
//  Require Nessessary Libraries
const path          =       require('path');                            // Path Library
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const Debug         =       require(`${CORE_DIR}/debug`);               // Require Debug Library
const DataLayer     =       require(`${CORE_DIR}/datalayer`);           // Datalayer Library
const Validator     =       require('validator');                       // Require Validator Library
const bCrypt        =       require('bcryptjs');                        // Require BCrypt Library
const Emails        =       require(`${CORE_DIR}/emails`);              // Emailing Library

class User {

}

// Export User Layer
module.exports = User;