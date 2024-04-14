//=================================================================
//  AppSway Ping Module Router
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
//  Require Nessessary Libraries
const Config        =       require(`${ROOT_DIR}/config`);              // Require Config
const Debug         =       require(`${CORE_DIR}/debug`);               // Require Debug Library
const express       =       require('express');                         // Require Express Library
const router        =       express.Router();                           // Require Routing Library

// Router
router.use("/", (req, res) => {
    res.send('Birds home page');
});

// Return Router Module
module.exports = router;