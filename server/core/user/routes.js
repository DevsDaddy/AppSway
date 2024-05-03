//=================================================================
//  AppSway User Layer Routes
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
const User          =       require(`${CORE_DIR}/user`);                // Require User Layer Library

// Authentication Routes
router.get("/", (req, res) => {
    // Detect Errors and Redirect
    let error = Auth.FilterBase(req?.query?.error) ?? null;
    let redirect = req?.query?.redirect ?? null;
    let edited = req?.query?.edited ?? null;

    // Check if is not authenticated
    if(!Auth.IsAlreadyAuthenticated(req, res)){
        return res.redirect('/auth/');
    }

    // Get User Profile
    Auth.GetUserByID(req.user.user_id, function(userData){
        return res.render("profile/index", {
            title: "My Profile",
            seo_description: `View profile information and status.`,
            seo_robots: "noindex,nofollow",
            error: error,
            redirect: redirect,
            edited: edited,
            profile: userData
        });
    }, function(error){
        throw new Error(error);
    });
});

// Return Router Module
module.exports = router;