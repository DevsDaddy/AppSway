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

// Authentication Layer Class
class Authentication {
    static passport = null;
    static User = null;
    static LocalStrategy = null;

    // Check Authentication
    static IsAuthenticated(req, res, next){
        if (Authentication.passport == null){
            throw new Error("Failed to process authentication. Passport library is not initialized.");
        }
        if (req.isAuthenticated())
            return next();

        if(req.isAPI){
            return res.json({ success: false, code: 401, message: "Authentication Required. Please, sign-in and try again later", stack: null });
        }

        return res.redirect('/auth/');
    }

    // Check Already Authenticated
    static IsAlreadyAuthenticated(req, res){
        if (Authentication.passport == null){
            throw new Error("Failed to process authentication. Passport library is not initialized.");
        }

        if (!req.isAuthenticated()) return false;
        return true;
    }

    // Setup Authentication
    static async SetupAuthentication(passport){
        Authentication.passport = passport;
        Authentication.User = DataLayer.LoadModel('User', path.join(CORE_DIR, '/auth/models/user'));
        Authentication.Auth = DataLayer.LoadModel('Auth', path.join(CORE_DIR, '/auth/models/auth'));
        Authentication.Codes = DataLayer.LoadModel('Codes', path.join(CORE_DIR, '/auth/models/codes'));
        Authentication.LocalStrategy = require('passport-local').Strategy;
        Authentication.JsonCustom = require('passport-json-custom').Strategy;

        // Serialize and Deserialize User
        Authentication.SerializeDeserialize(Authentication.Auth);
        Authentication.SetupLocalStartegies();
    }

    // Basic Login
    static Login(req, res, next){
        // Check if is already authenticated
        if(Authentication.IsAlreadyAuthenticated(req, res)){
            return res.build(true, null, { redirect: '/user/' });
        }

        // Authenticate
        Authentication.passport.authenticate('local-signin', function(err, user, info, status){
            if((info !== undefined && info != null && info.message !== undefined && info.message != null) || err){
                let message = err ?? info.message;
                req.session.destroy(function(err) {});
                return res.build(false, message, { redirect: '/auth/'});
            }

            if(!user){
                req.session.destroy(function(err) {});
                return res.build(false, 'Failed to authenticate. No authentication data found', { redirect: '/auth/' });
            }

            // Login
            req.login(user, function(error) {
                if (error){
                    return res.build(false, error, { redirect: '/auth/' });
                }
                return res.build(true, null, { redirect: '/user/' });
            });
        })(req,res,next);
    }

    // Basic Registration
    static Register(req, res, next){
        // Check if is already authenticated
        if(Authentication.IsAlreadyAuthenticated(req, res)){
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

        // Sign-Up using Passport
        Authentication.passport.authenticate('local-signup', function(err, user, info, status){
            if((info !== undefined && info != null && info.message !== undefined && info.message != null) || err){
                let message = err ?? info.message;
                return res.build(false, message, { redirect: '/auth/sign_up/'});
            }

            // Need Confirm Email
            if(Config?.Authentication?.ConfirmEmails){
                return res.build(true, null, { redirect: '/auth/confirm/', confirmedAccount: false });
            }

            return res.build(true, null, { redirect: '/user/', confirmedAccount: true });
        })(req,res,next);
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
        if(Authentication.IsAlreadyAuthenticated(req, res)){
            return res.build(true, null, { redirect: '/user/' });
        }
    }

    // Request Forgot Password
    static RequestForgot(req, res){
        // Check if is already authenticated
        if(Authentication.IsAlreadyAuthenticated(req, res)){
            return res.build(true, null, { redirect: '/user/' });
        }
    }

    // Reset password
    static ResetPassword(req, res){
        // Check if is already authenticated
        if(Authentication.IsAlreadyAuthenticated(req, res)){
            return res.build(true, null, { redirect: '/user/' });
        }

    }

    // Confirm Account
    static ConfirmAccount(req, res){
        // Check if is already authenticated
        if(Authentication.IsAlreadyAuthenticated(req, res)){
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

    // Setup Local Strategies
    static SetupLocalStartegies(){
        const temporaryEnd = new Date();
        const guestLifetime = Config?.Authentication?.GuestLifetime ?? 12;
        temporaryEnd.setMonth(temporaryEnd.getMonth() + guestLifetime);

        // Local Sign-Up
        Authentication.passport.use('local-signup', new Authentication.LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function (req, email, password, done) {
            // Check Password Confirmation
            let confirmPass = req.body.confirm_password ?? null;
            if(confirmPass == null || confirmPass != password){
                return done(null, false, {
                    message: 'The passwords you entered do not match. Check if it is correct and try again.'
                });
            }

            // Create User Data
            Authentication.CreateUserData({
                firstname: req.body.firstname ?? "",
                lastname: req.body.lastname ?? "",
                username: req.body.username,
                about: "",
                email: email,
                avatar: "",
                status: Config?.Authentication?.ConfirmEmails ? "inactive" : "active",
                temporaryEnd: temporaryEnd
            }, function(newUser){
                // Return Authentication Data
                Authentication.CreateAuthData(email, password, 'local', newUser.id, function(newAuth){
                    Authentication.SendRegistrationEmail(newUser.id, newUser.email, newUser.username, function(){
                        Debug.Log(`New User Registered: ID: ${newUser.id}, Email: ${email}, Username: ${newUser.username}`);
                        return done(null, newAuth);
                    }, function(error){
                        return done(null, false, {
                            message: error?.message ?? error
                        });
                    });
                }, function(error){
                    return done(null, false, {
                        message: error?.message ?? error
                    });
                });
            }, function(error){
                return done(null, false, {
                    message: error?.message ?? error
                });
            });
        }));
    
        // Local Sign-In
        Authentication.passport.use('local-signin', new Authentication.LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function (req, email, password, done) {
            Authentication.CheckAuthData(email, password, 'local', function(authData){
                return done(null, authData);
            }, function(error){
                return done(null, false, {
                    message: error?.message ?? error
                });
            });
        }));

        // Json Custom Auth
        Authentication.passport.use('json-custom', new Authentication.JsonCustom({
            passReqToCallback: true
        }, function(req, credentials, done){
            if(!credentials.user_id){
                return done(null, false, {
                    message: "Failed to authenticate. No user id provided in request."
                });
            }

            if(!credentials.token){
                return done(null, false, {
                    message: "Failed to authenticate. No user token provided in request."
                });
            }

            if(!credentials.from){
                credentials.from = 'local';
            }

            Authentication.CheckAuthCredentials(credentials.user_id, credentials.token, credentials.from, function(authData){
                return done(null, authData);
            }, function(error){
                return done(null, false, {
                    message: error?.message ?? error
                });
            });
        }));
    }

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

    // Serialize and Deserialize User
    static SerializeDeserialize(AuthModel){
        Authentication.passport.serializeUser(function (user, done) {
            done(null, user.id);
        });
        Authentication.passport.deserializeUser(function (id, done) {
            AuthModel.findOne({
                where: {
                    id: id
                }
            }).then(function (user) {
                if (user) {
                    done(null, user.get());
                } else {
                    done(`User with ID ${id} is not found at the system.`, null);
                }
            }).catch(function (err) {
                Debug.Log(err);
                done(err, null);
                return;
            });
        });
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
                onComplete(authData);
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
        // Check Valid Password
        var isValidPassword = function (userpass, password) {
            return bCrypt.compareSync(password, userpass);
        };

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
            if(auth.from == 'local'){
                if (!isValidPassword(auth.token, token)) {
                    onError('Authentication Error. Invalid password or login information.');
                    return;
                }
            }else{
                if(auth.token !== token){
                    onError('Authentication Error. Invalid token or login information.');
                    return;
                }
            }
            
            // Get Authentication Data
            var authData = auth.get();
            Authentication.GetUserByID(user_id, function(userData){
                onComplete(authData);
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

    // Get User by ID
    static GetUserByID(userId, onComplete, onError){
        Authentication.User.findOne({
            id: userId
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
                onError('An email has already been sent to this user requesting account activation');
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
    static ValidateCode(validatedCode, onComplete, onError) {
        Authentication.Codes.findOne({
            where: {
                code: validatedCode
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
                    onComplete();
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