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
    // Setup Authentication
    static async SetupDataLayer(){
        User.Profile = DataLayer.LoadModel('User', path.join(CORE_DIR, '/auth/models/user'));
        User.Contacts = DataLayer.LoadModel('UserContacts', path.join(CORE_DIR, '/user/models/user_contacts'));
        User.Additional = DataLayer.LoadModel('UserAdditional', path.join(CORE_DIR, '/user/models/user_additional'));
    }

    // Get User Contacts
    static async GetUserContacts(userId){
        try{
            var user = await User.Contacts.findOne({
                where: {
                    user_id: userId
                }
            });
            var userData = user?.get() ?? null;
            return userData;
        }catch(error){
            return false;
        }
    }

    // Get User Additional Data
    static async GetUserAdditionalData(userId){
        try{
            var user = await User.Additional.findOne({
                where: {
                    user_id: userId
                }
            });
            var userData = user?.get() ?? null;
            return userData;
        }catch(error){
            return false;
        }
    }

    // is User Online
    static IsUserOnline(lastOnline){
        var startDate = lastOnline;
        var endDate   = new Date();
        var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
        return (seconds > 600) ? false : true;
    }
}

// Export User Layer
module.exports = User;