// Nickname Checker
let usernameField = document.getElementById("nickfield");
let errorField = document.getElementById("username_error");

// Add Handler
const usernameHandler = function(e){
    let error = null;
    let val = e.target.value;
    if(val.length < 5 || val.length > 32){
        error = "Username must be from 5 to 32 symbols.";
    }

    let usernameRegex = /^([a-zA-Z0-9\_\.]+$)/g;
    if(!usernameRegex.test(val) && error == null){
        error = "Username may contain only letters, cyphers, and a periods or underscores.";
    }

    errorField.innerHTML = (error != null && error.length > 0) ? error: "";
    errorField.style.display = (error != null && error.length > 0) ? "block" : "none";
};

// Add Listeners
usernameField.addEventListener('input', usernameHandler);
usernameField.addEventListener('propertychange', usernameHandler);