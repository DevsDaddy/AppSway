//=================================================================
//  AppSway User Basic Model
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
// Define Model
module.exports = function(database, Sequelize, DataTypes) {
    const User = database.define('users', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                lenValidate(value){
                    if(value !== undefined && value != null && value.length > 0){
                        if(value.length < 2 || value.length > 30){
                            throw new Error(`Firstname must be from 2 to 30 symbols.`);
                        }
                    }
                }
            }
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                lenValidate(value){
                    if(value !== undefined && value != null && value.length > 0){
                        if(value.length < 2 || value.length > 30){
                            throw new Error(`Lastname must be from 2 to 30 symbols.`);
                        }
                    }
                }
            }
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                lenValidate(value){
                    if(value !== undefined && value != null && value.length > 0){
                        if(value.length < 2 || value.length > 30){
                            throw new Error(`Country must be from 2 to 30 symbols.`);
                        }
                    }
                }
            }
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                lenValidate(value){
                    if(value !== undefined && value != null && value.length > 0){
                        if(value.length < 2 || value.length > 50){
                            throw new Error(`City must be from 2 to 50 symbols.`);
                        }
                    }
                }
            }
        },
        username: {
            type: DataTypes.STRING,
            notEmpty: true,
            allowNull: false,
            validate: {
                validateUserName(value){
                    if(!value){
                        throw new Error('Username is required for account creation');
                    }
                    if(value.length < 5 || value.length > 32){
                        throw new Error('Username must be contain from 5 to 32 symbols');
                    }
                    let regEx = /^([a-zA-Z0-9\_\.]+$)/g;
                    if(!regEx.test(value)){
                        throw new Error('Username can contain only latin symbols, numbers and underscore or dot symbols.');
                    }

                    return User.findOne({ where:{ username:value }})
                        .then((username) => {
                        if (username) {
                            throw new Error('Username already taken by another account');
                        }
                    })
                }
            }
        },
        about: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                lenValidate(value){
                    if(value !== undefined && value != null && value.length > 0){
                        if(value.length > 250){
                            throw new Error(`About info can contain up to 250 symbols.`);
                        }
                    }
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true
            }
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        last_online: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        registration: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'banned', 'guest'),
            defaultValue: 'active'
        },
        temporaryEnd: {
            type: DataTypes.DATE
        }
    });
    return User;
};