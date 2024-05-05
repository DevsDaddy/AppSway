//=================================================================
//  AppSway Auth Layer Routes
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
const express       =       require('express');                         // Require Express Library
const router        =       express.Router();                           // Require Routing Library
const Auth          =       require(`${CORE_DIR}/auth`);                // Require Authentication Layer Library

// Authentication Routes
router.get("/", Auth.CheckAuthentication, (req, res) => {
    // Detect Errors and Redirect
    let error = Auth.FilterBase(req?.query?.error) ?? null;
    let redirect = req?.query?.redirect ?? null;
    let activated = req?.query?.activated ?? null;
    let password_changed = req?.query?.pass_changed ?? null;

    // Check if is already authenticated
    if(req.isAuth){
        return res.redirect('/user/');
    }

    // Render Page
    return res.render("system/auth", {
        title: "Sign In",
        seo_description: `Authorize in the application using a convenient way for you to get full access to all functions.`,
        seo_robots: "noindex,nofollow",
        error: error,
        redirect: redirect,
        activated: activated,
        password_changed: password_changed
    });
});
router.get("/sign_up", Auth.CheckAuthentication, (req, res) => {
    // Detect Errors and Redirect
    let error = Auth.FilterBase(req?.query?.error) ?? null;
    let redirect = req?.query?.redirect ?? null;

    // Check if is already authenticated
    if(req.isAuth){
        return res.redirect('/user/');
    }

    // Render Page
    return res.render("system/signup", {
        title: "Sign Up",
        seo_description: `Create a new Account for the application to get full access to all functions.`,
        seo_robots: "noindex,nofollow",
        error: error,
        redirect: redirect
    });
});
router.get("/forgot", Auth.CheckAuthentication, (req, res) => {
    // Detect Errors and Redirect
    let error = Auth.FilterBase(req?.query?.error) ?? null;
    let redirect = req?.query?.redirect ?? null;

    // Check if is already authenticated
    if(req.isAuth){
        return res.redirect('/user/');
    }

    // Render Page
    return res.render("system/forgot", {
        title: "Forgot Password",
        seo_description: `Forget password? Just type your email and follow the instructions.`,
        seo_robots: "noindex,nofollow",
        error: error,
        redirect: redirect
    });
});
router.get("/reset", Auth.CheckAuthentication, (req, res) => {
    // Detect Errors and Redirect
    let error = Auth.FilterBase(req?.query?.error) ?? null;
    let redirect = req?.query?.redirect ?? null;
    let code = Auth.FilterCode(req?.query?.code) ?? "";

    // Check if is already authenticated
    if(req.isAuth){
        return res.redirect('/user/');
    }

    // Render Page
    return res.render("system/reset", {
        title: "Reset Password",
        seo_description: `Follow the instructions in the email sent to your email to reset your password.`,
        seo_robots: "noindex,nofollow",
        error: error,
        redirect: redirect,
        code: code
    });
});
router.get("/confirm", Auth.CheckAuthentication, (req, res) => {
    // Detect Errors and Redirect
    let error = Auth.FilterBase(req?.query?.error) ?? null;
    let redirect = req?.query?.redirect ?? null;
    let code = Auth.FilterCode(req?.query?.code) ?? "";

    // Check if is already authenticated
    if(req.isAuth){
        return res.redirect('/user/');
    }

    // Render Page
    return res.render("system/confirm", {
        title: "Confirm Your Account",
        seo_description: `Follow the instructions in the email sent to your email to activate your account.`,
        seo_robots: "noindex,nofollow",
        error: error,
        redirect: redirect,
        code: code
    });
});

// API Auth / Web Requests
router.post("/login", Auth.CheckAuthentication, Auth.Login);
router.post("/register", Auth.CheckAuthentication, Auth.Register);
router.post("/guest_signup", Auth.CheckAuthentication, Auth.GuestLogin);
router.post("/logout", Auth.Logout);
router.get("/logout", Auth.Logout);
router.post("/request_forgot", Auth.CheckAuthentication, Auth.RequestForgot);
router.post("/reset_password", Auth.CheckAuthentication, Auth.ResetPassword);
router.post("/confirm_account", Auth.CheckAuthentication, Auth.ConfirmAccount);
router.post("/link_social", Auth.CheckAuthentication, Auth.LinkSocial);

// Return Router Module
module.exports = router;