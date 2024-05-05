//=================================================================
//  AppSway Authentication Layer
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
const DataLayer     =       require(`${CORE_DIR}/datalayer`);           // Datalayer Library
const Validator     =       require('validator');                       // Require Validator Library
const bCrypt        =       require('bcryptjs');                        // Require BCrypt Library
const Emails        =       require(`${CORE_DIR}/emails`);              // Emailing Library
const session       =       require('express-session');                 // Session Library

// Authentication Layer Class
class Authentication {
    static User = null;
    static Auth = null;
    static Codes = null;

    // Setup Authentication
    static async SetupAuthentication(){
        Authentication.User = DataLayer.LoadModel('User', path.join(CORE_DIR, '/auth/models/user'));
        Authentication.Auth = DataLayer.LoadModel('Auth', path.join(CORE_DIR, '/auth/models/auth'));
        Authentication.Codes = DataLayer.LoadModel('Codes', path.join(CORE_DIR, '/auth/models/codes'));
    }

    // Check Authentication
    static async CheckAuthentication(req, res, next){
        // Check Session User ID / Token
        let authenticated = false;
        let user_id = null;
        let token = null;
        let from = null;

        if(req.session && req.session.user_id && req.session.token){
            user_id = req.session.user_id;
            token = req.session.token;
            from = req.session?.from ?? 'local';
        }else if(req.body && req.body.user_id && req.body.token){
            user_id = req.body.user_id;
            token = req.body.token;
            from = req.body?.from ?? 'local';
        }

        if(user_id != null && token != null){
            Authentication.CheckAuthCredentials(user_id, token, from, function(authData, userData){
                authenticated = true;
                req.isAuth = authenticated;
                req.auth = authData;
                req.user = userData;
                
                return next();
            }, function(error){
                req.isAuth = authenticated;
                req.auth = null;
                req.user = null;
                return next();
            });
        }else{
            // Setup Authentication Data
            req.isAuth = authenticated;
            req.auth = null;
            req.user = null;
            return next();
        }
    }

    // Basic Login
    static Login(req, res, next){
        // Check if is already authenticated
        if(req.isAuth){
            return res.build(true, null, { redirect: '/user/' });
        }

        // Login and Password
        let email = null;
        let password = null;

        // Get Values
        if(req.body && req.body.email && req.body.email.length > 0){
            email = req.body.email;
        }else{
            return res.build(false, 'Please, type your email for authentication', { redirect: '/auth/' });
        }
        if(req.body && req.body.password && req.body.password.length > 0){
            password = req.body.password;
        }else{
            return res.build(false, 'Please, type your password for authentication', { redirect: '/auth/' });
        }

        // Validate Login
        if(!Validator.isEmail(email)){
            return res.build(false, 'Please enter your email in full format. For example: myemail@example.com', { redirect: '/auth/' });
        }

        // Check Authentication Data
        Authentication.CheckAuthData(email, password, 'local', function(authData, userData){
            req.isAuth = true;
            req.auth = authData;
            req.user = userData;
            req.session.user_id = userData.id;
            req.session.token = authData.token;
            req.session.from = authData.from;
            req.session.save();
            return res.build(true, null, { redirect: '/user/' });
        }, function(error){
            req.session.destroy(function(err) {});
            return res.build(false, error?.message ?? error, { redirect: '/auth/'});
        });
    }

    // Basic Registration
    static Register(req, res, next){
        // Check if is already authenticated
        if(req.isAuth){
            return res.build(true, null, { redirect: '/user/' });
        }

        // Error
        let error = null;

        // Check Agreement Checkbox
        let acceptedTerms = req?.body?.terms_accepted ?? false;
        if(!acceptedTerms){
            error = 'Before registering, you must read and accept the user agreement and privacy policy.';
            return res.build(false, error, { redirect: '/auth/sign_up/' });
        }

        // Get Values
        let email = null;
        let password = null;
        if(req.body && req.body.email && req.body.email.length > 0){
            email = req.body.email;
        }else{
            return res.build(false, 'Please, type your email for authentication', { redirect: '/auth/' });
        }
        if(req.body && req.body.password && req.body.password.length > 0){
            password = req.body.password;
        }else{
            return res.build(false, 'Please, type your password for authentication', { redirect: '/auth/' });
        }

        // Check Password Confirmation
        let confirmPass = req.body.confirm_password ?? null;
        if(confirmPass == null || confirmPass != password){
            return res.build(false, 'The passwords you entered do not match. Check if it is correct and try again.', { redirect: '/auth/sign_up/'});
        }

        // Check User Name
        if(!req.body || !req.body.username){
            return res.build(false, 'Username is required to register a new account', { redirect: '/auth/sign_up/'});
        }

        // Create User Data
        Authentication.CreateUserData({
            firstname: "",
            lastname: "",
            username: req.body.username,
            about: "",
            email: email,
            avatar: "",
            status: Config?.Authentication?.ConfirmEmails ? "inactive" : "active"
        }, function(newUser){
            // Return Authentication Data
            Authentication.CreateAuthData(email, password, 'local', newUser.id, function(newAuth){
                Authentication.SendRegistrationEmail(newUser.id, newUser.email, newUser.username, function(){
                    Debug.Log(`New User Registered: ID: ${newUser.id}, Email: ${email}, Username: ${newUser.username}`);

                    if(Config?.Authentication?.ConfirmEmails){
                        return res.build(true, null, { redirect: '/auth/confirm/', confirmedAccount: false });
                    }

                    return res.build(true, null, { redirect: '/user/', confirmedAccount: true });
                }, function(error){
                    return res.build(false, error?.message ?? error, { redirect: '/auth/sign_up/'});
                });
            }, function(error){
                return res.build(false, error?.message ?? error, { redirect: '/auth/sign_up/'});
            });
        }, function(error){
            return res.build(false, error?.message ?? error, { redirect: '/auth/sign_up/'});
        });
    }

    // Basic Logout
    static Logout(req, res){
        if(req.method == "GET") req.isAPI = false;
        req.session.destroy(function(err) {
        });
        return res.build(true, null, { redirect: '/auth/' });
    }

    // Guest Login
    static GuestLogin(req, res){
        // Check if is already authenticated
        if(req.isAuth){
            return res.build(true, null, { redirect: '/user/' });
        }
    }

    // Request Forgot Password
    static RequestForgot(req, res){
        // Check if is already authenticated
        if(req.isAuth){
            return res.build(true, null, { redirect: '/user/' });
        }

        // Get Values
        let email = null;
        if(req.body && req.body.email && req.body.email.length > 0){
            email = req.body.email;
        }else{
            return res.build(false, 'Please enter your email address provided when registering your account.', { redirect: '/auth/forgot/' });
        }

        // Get User Data
        Authentication.User.findOne({
            where: {
                email: email
            }
        }).then(function (user) {
            // Check User Exists
            if(!user){
                onError('The user with this email address is not registered in the system.');
                return;
            }

            // Check User Status
            let userData = user.get();
            if(userData.status == "inactive"){
                onError('The user profile has not been activated.');
                return;
            }
            if(userData.status == "banned"){
                onError(`The user has been banned for violating the platform's terms of use`);
                return;
            }

            // Get Authentication Data
            Authentication.Auth.findOne({
                where: {
                    login: email,
                    from: 'local'
                }
            }).then(function (auth) {
                // Check Auth Exists
                if(!auth){
                    onError('The user with this email was registered by another authorization method without a password. Try logging in with your social networks using the same email.');
                    return;
                }

                // Send Forgot Email
                Authentication.SendForgotEmail(userData.id, userData.email, userData.username, function(){
                    Debug.Log(`User Requested Password Recovery: ID: ${userData.id}, Email: ${userData.email}, Username: ${userData.username}`);
                    return res.build(true, null, { redirect: '/auth/reset/' });
                }, function(error){
                    return res.build(false, error?.message ?? error, { redirect: '/auth/forgot/'});
                });
            }).catch(function (error) {
                return res.build(false, error?.message ?? error, { redirect: '/auth/forgot/' });
            });
        }).catch(function (error) {
            return res.build(false, error?.message ?? error, { redirect: '/auth/forgot/' });
        });
    }

    // Reset password
    static ResetPassword(req, res){
        // Check if is already authenticated
        if(req.isAuth){
            return res.build(true, null, { redirect: '/user/' });
        }

        // Get Values
        let code = null;
        let password = null;
        if(req.body && req.body.code && req.body.code.length > 0){
            code = req.body.code;
        }else{
            return res.build(false, 'Please, type your recovery code to reset password', { redirect: '/auth/reset/' });
        }
        if(req.body && req.body.password && req.body.password.length > 0){
            password = req.body.password;
        }else{
            return res.build(false, 'Please, type your new password to recover account', { redirect: '/auth/reset/' });
        }
        let validatedCode = Authentication.FilterCode(code);
        if(validatedCode == null){
            return res.build(false, 'Failed to complete recovery process. Provided validation code has wrong format.', { redirect: '/auth/reset/' });
        }

        // Check Password Confirmation
        let confirmPass = req.body.confirm_password ?? null;
        if(confirmPass == null || confirmPass != password){
            return res.build(false, 'The passwords you entered do not match. Check if it is correct and try again.', { redirect: '/auth/reset/'});
        }

        // Validate Code
        Authentication.ValidateCode(validatedCode, function(userId){
            // Change Password
            Authentication.ChangeAuthData(userId, password, function(){
                return res.build(true, null, { redirect: '/auth/?pass_changed=true' });
            }, function(error){
                return res.build(false, error, { redirect: '/auth/reset/' });
            });
        }, function(error){
            return res.build(false, error, { redirect: '/auth/reset/' });
        }, 'recovery');
    }

    // Confirm Account
    static ConfirmAccount(req, res){
        // Check if is already authenticated
        if(req.isAuth){
            return res.build(true, null, { redirect: '/user/' });
        }

        // Validate Code
        let code = req?.body?.code;
        let validatedCode = Authentication.FilterCode(code);
        if(validatedCode == null){
            return res.build(false, 'Failed to complete validation process. Provided validation code has wrong format.', { redirect: '/auth/confirm/' });
        }

        Authentication.ValidateCode(validatedCode, function(){
            return res.build(true, null, { redirect: '/auth/?activated=true' });
        }, function(error){
            return res.build(false, error, { redirect: '/auth/confirm/' });
        });
    }

    // Link Social Account
    static LinkSocial(req, res){
        
    }

    // Change Password of active user
    static ChangePassword(req, res){
        // Check if is already authenticated
        if(!req.isAuth){
            return res.build(true, null, { redirect: '/auth/' });
        }

        

    }

    // Filter Base Values
    static FilterBase(string){
        if(!string || string.length < 1) return null;
        string = Validator.escape(string);
        return string;
    }

    // Filter Validation Codes
    static FilterCode(code){
        if(!code || code.length < 1) return null;
        let regex = /^([a-zA-Z0-9]{5})-([a-zA-Z0-9]{5})-([a-zA-Z0-9]{5})-([a-zA-Z0-9]{5})+$/g;
        if(regex.test(code)){
            return code;
        }

        return null;
    }

    // Send Registration Email
    static SendRegistrationEmail(userId, email, username, onSuccess, onError){
        // Send Email
        if(Config?.Authentication?.ConfirmEmails){
            // Send Template
            Authentication.GenerateActivationKey(userId, function(codeData){
                Emails.SendTemplate(email, `${Config?.Application?.Name} Account Activation`, 'account_confirm', {
                    TITLE: 'Account Activation',
                    APPLICATION: Config?.Application?.Name ?? "AppSway",
                    KEY: codeData.code,
                    EMAIL: email,
                    LINK: `https://${Config?.Application?.Domain}/auth/confirm/?code=${codeData.code}`,
                    PRIVACY_LINK: `https://${Config?.Application?.Domain}/terms/privacy/`,
                    TERMS_LINK: `https://${Config?.Application?.Domain}/terms/general/`,
                    YEAR: new Date().getFullYear()
                }).then(function(){}).catch(function (err) {
                    return;
                });
                
                onSuccess();
            }, function(error){
                Debug.Log(`Err2: ${error}`);
                onError(error);
            });
        }else{
            Emails.SendTemplate(email, `Welcome to ${Config?.Application?.Name}`, 'welcome', {
                TITLE: `Welcome to ${Config?.Application?.Name}`,
                APPLICATION: Config?.Application?.Name ?? "AppSway",
                EMAIL: email,
                LINK: `https://${Config?.Application?.Domain}/user/`,
                PRIVACY_LINK: `https://${Config?.Application?.Domain}/terms/privacy/`,
                TERMS_LINK: `https://${Config?.Application?.Domain}/terms/general/`,
                USER_NAME: username,
                YEAR: new Date().getFullYear()
            }).then(function(){}).catch(function (err) {
                return;
            });
            
            onSuccess();
        }
    }

    // Send Forgot Email
    static SendForgotEmail(userId, email, username, onSuccess, onError){
        // Send Template
        Authentication.GenerateActivationKey(userId, function(codeData){
            Emails.SendTemplate(email, `${Config?.Application?.Name} Account Recovery`, 'account_confirm', {
                TITLE: 'Account Recovery',
                APPLICATION: Config?.Application?.Name ?? "AppSway",
                KEY: codeData.code,
                EMAIL: email,
                LINK: `https://${Config?.Application?.Domain}/auth/reset/?code=${codeData.code}`,
                PRIVACY_LINK: `https://${Config?.Application?.Domain}/terms/privacy/`,
                TERMS_LINK: `https://${Config?.Application?.Domain}/terms/general/`,
                YEAR: new Date().getFullYear()
            }).then(function(){}).catch(function (err) {
                return;
            });
            
            onSuccess();
        }, function(error){
            onError(error);
        }, 'recovery');
    }

    // Create Auth Data
    static CreateAuthData(login, token, from, userId, onComplete, onError) {
        // Generate Hash
        var generateHash = function (password) {
            return bCrypt.hashSync(token, bCrypt.genSaltSync(8), null);
        };

        // Generate Auth Data
        var userPassword = generateHash(token);
        var authData = {
            login: login,
            token: userPassword,
            from: from,
            user_id: userId
        };

        // Find Authentication
        Authentication.Auth.findOne({
            where: {
                login: login,
                from: from
            }
        }).then(function (auth) {
            if (auth) { // Authentication found
                onError('A user with this credentials has already been registered');
                return;
            }

            // Create Authentication
            Authentication.Auth.create(authData).then(function (newAuth, created) {
                if (!newAuth) {
                    onError('Failed to create authentication data. Unknown error. Please, contact with administrator.');
                    return;
                }

                if (newAuth) {
                    onComplete(newAuth);
                }
            }).catch(function (err) {
                onError(err);
            });
        }).catch(function (err) {
            onError(err);
        });
    }

    // Change Authentication Data
    static ChangeAuthData(userId, token, onComplete, onError){
        // Generate Hash
        var generateHash = function (password) {
            return bCrypt.hashSync(token, bCrypt.genSaltSync(8), null);
        };

        // Find Authentication Data by User Id
        Authentication.Auth.findOne({
            where: {
                user_id: userId,
                from: 'local'
            }
        }).then(function(auth){
            if(!auth){
                onError('Failed to change user credentials. Authentication data for this user is not found.');
                return;
            }

            // Generate Auth Data
            var userPassword = generateHash(token);
            Authentication.Auth.update({
                token: userPassword
            }, { 
                where: {
                    user_id: userId,
                    from: 'local'
                }
            }).then(function(newAuth){
                onComplete();
            }).catch(function (err) {
                onError(err);
                return;
            });
        }).catch(function (err) {
            onError(err);
            return;
        });
    }

    // Create User Data
    static CreateUserData(userData, onComplete, onError){
        // Find Authentication
        Authentication.User.findOne({
            where: {
                email: userData.email
            }
        }).then(function (user) {
            if (user) { // User found
                onError('A user with this email has already been registered');
                return;
            }

            // Create User
            Authentication.User.create(userData).then(function(newUser, created) {
                if (!newUser) {
                    onError('Failed to create user. Unknown error. Please, contact with administrator.');
                    return;
                }

                // On Complete
                onComplete(newUser);
                return;
            }).catch(function (err) {
                onError(err);
                return;
            });
        }).catch(function (err) {
            onError(err);
            return;
        });
    }

    // Check Auth Data
    static CheckAuthData(login, token, from, onComplete, onError){
        // Check Valid Password
        var isValidPassword = function (userpass, password) {
            return bCrypt.compareSync(password, userpass);
        };

        // Check with Validator
        if(!Validator.isAlphanumeric(from)){
            onError('Failed to confirm authenitcation credentials. From flag must contain only alphanumeric values.');
            return;
        }

        // Find Auth Data
        Authentication.Auth.findOne({
            login: login,
            from: from
        }).then(function (auth) {
            if(!auth){
                onError('Authentication Error. User with such data is not found in the system.');
                return;
            }

            // Check Password is Valid
            if (!isValidPassword(auth.token, token)) {
                onError('Authentication Error. Invalid password or login information.');
                return;
            }

            // Get Authentication Data
            var authData = auth.get();
            Authentication.GetUserByID(authData.user_id, function(userData){
                onComplete(authData, userData);
                return;
            }, function(error){
                onError(error);
                return;
            });
        }).catch(function (err) {
            onError(err);
            return;
        });
    }

    // Check Auth Credentials
    static CheckAuthCredentials(user_id, token, from, onComplete, onError){
        // Check with Validator
        if(!Validator.isUUID(user_id, 4)){
            onError('Failed to confirm authenitcation credentials. User ID must contain UUIDv4 string.');
            return;
        }
        if(!Validator.isAlphanumeric(from)){
            onError('Failed to confirm authenitcation credentials. From flag must contain only alphanumeric values.');
            return;
        }

        // Find Auth Data
        Authentication.Auth.findOne({
            user_id: user_id,
            from: from
        }).then(function (auth) {
            if(!auth){
                onError('Authentication Error. User with such data is not found in the system.');
                return;
            }

            // Check Password is Valid
            if(auth.token !== token){
                onError('Authentication Error. Invalid token or login information.');
                return;
            }
            
            // Get Authentication Data
            var authData = auth.get();
            Authentication.GetUserByID(user_id, function(userData){
                // Update Online
                let endDate = new Date();
                if(((endDate.getTime() - userData.last_online.getTime()) / 1000) > 600){
                    Authentication.SetUserOnline(user_id, function(){
                        userData.last_online = endDate;
                        onComplete(authData, userData);
                        return;
                    }, function(error){
                        onError(error);
                        return;
                    });
                }else{
                    onComplete(authData, userData);
                    return;
                }
            }, function(error){
                onError(error);
                return;
            });
        }).catch(function (err) {
            onError(err);
            return;
        });
    }

    // Get User by ID
    static GetUserByID(userId, onComplete, onError){
        if(!Validator.isUUID(userId, 4)){
            onError('Failed to get user profile. User ID must contain UUIDv4 string.');
            return;
        }

        // Find User
        Authentication.User.findOne({
            where: {
                id: userId
            }
        }).then(function (user) {
            // Check User Exists
            if(!user){
                onError('Failed to get user profile. It may have been deleted.');
                return;
            }

            // Check User Status
            let userData = user.get();
            if(userData.status == "inactive"){
                onError('The user profile has not been activated.');
                return;
            }
            if(userData.status == "banned"){
                onError(`The user has been banned for violating the platform's terms of use`);
                return;
            }

            // Return Auth Data
            onComplete(userData);
            return;
        }).catch(function (err) {
            onError(err);
            return;
        });
    }

    // Set User Online
    static SetUserOnline(userId, onComplete, onError){
        if(!Validator.isUUID(userId, 4)){
            onError('Failed to get user profile. User ID must contain UUIDv4 string.');
            return;
        }

        // Find User
        Authentication.User.update({
            last_online: new Date()
        }, {
            where: {
                id: userId
            }
        }).then(function (updated) {
            onComplete();
            return;
        }).catch(function (err) {
            onError(err);
            return;
        });
    }

    // Generate Activation Key
    static GenerateActivationKey(userId, onComplete, onError, codeType = 'activation'){
        // Valid-For
        const validFor = new Date();
        if(codeType == 'activation')
            validFor.setMonth(validFor.getMonth() + 1);
        else
            validFor.setHours(validFor.getHours() + 1);

        // Get Model
        let codeData = {
            user_id: userId,
            code: Authentication.GenerateKeyCode(),
            type: codeType,
            valid_for: validFor
        };

        // Find Authentication
        Authentication.Codes.findOne({
            where: {
                user_id: userId
            }
        }).then(function (user) {
            if (user) { // User found
                onError(`An email has already been sent to this user requesting account ${codeType}`);
                return;
            }

            // Create User
            Authentication.Codes.create(codeData).then(function(newCode, created) {
                if (!newCode) {
                    onError('Failed to create user activation code. Unknown error. Please, contact with administrator.');
                    return;
                }

                // On Complete
                onComplete(newCode);
                return;
            }).catch(function (err) {
                Debug.Log(`Err4: ${err}`);
                onError(err);
                return;
            });
        }).catch(function (err) {
            onError(err);
            return;
        });
    }

    // Validate Code
    static ValidateCode(validatedCode, onComplete, onError, codeType = 'activation') {
        // Validate Code
        Authentication.Codes.findOne({
            where: {
                code: validatedCode,
                type: codeType
            }
        }).then(function (codeData) {
            if (!codeData) { // Code not found
                onError('This code is not found. Please, check your code and try again.');
                return;
            }

            // Get Code Info
            let codeInfo = codeData.get();

            // Get User Info
            Authentication.User.findOne({
                where: {
                    id: codeInfo.user_id
                }
            }).then(function(user){
                if(!user){
                    onError('This code is can not be applied. User not found.');
                    return;
                }

                // User Already Activated
                let userData = user.get();
                if(codeInfo.type == 'activation' && userData.status != 'inactive'){
                    Authentication.Codes.destroy({
                        where: {
                            code: validatedCode
                        }
                    });
                    onComplete();
                    return;
                }

                // Code is Expired
                if(codeInfo.valid_for < new Date()){
                    Authentication.Codes.destroy({
                        where: {
                            code: validatedCode
                        }
                    }).then(function(data){
                        if(codeInfo.type == 'activation'){
                            Authentication.SendRegistrationEmail(userData.id, userData.email, function(){
                                onError('This code cannot be applied as it has expired. A new confirmation code has been sent to your email.');
                                return;
                            }, function(error){
                                onError(error);
                                return;
                            });
                        }else{
                            onError('This code cannot be applied as it has expired. Try requesting a new code.');
                            return;
                        }
                    }).catch(function (err) {
                        onError(err);
                        return;
                    });
                    return;
                }

                // Code is Not Expired
                Authentication.Codes.destroy({
                    where: {
                        code: validatedCode
                    }
                });

                if(codeInfo.type == 'activation' && userData.status == 'inactive'){
                    Authentication.User.update({
                        status: 'active'
                    }, {
                        where: {
                            id: codeInfo.user_id
                        }
                    }).then(function(updatedUser){
                        onComplete();
                        return;
                    }).catch(function (err) {
                        onError(err);
                        return;
                    });
                }else{
                    onComplete(userData.id);
                    return;
                }
            }).catch(function (err) {
                onError(err);
                return;
            });
        }).catch(function (err) {
            onError(err);
            return;
        });
    }

    // Generate Key Code
    static GenerateKeyCode(){
        function generatePart(length){
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }
            return result;
        }

        let code = `${generatePart(5)}-${generatePart(5)}-${generatePart(5)}-${generatePart(5)}`;
        return code;
    }
}

// Export Authentication Layer
module.exports = Authentication;