//=================================================================
//  AppSway User Contacts Data Model
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
// Define Model
module.exports = function(database, Sequelize, DataTypes) {
    const UserContacts = database.define('user_contacts', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            references: {
                model: 'users',
                key: 'id',
            }
        },
        public_email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                validateEmail(value){
                    if(value && value.length > 0){
                        let regEx = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
                        if(!regEx.test(value)){
                            throw new Error('Please provide a full email address. For example: hello@example.com');
                        }
                    }
                }
            }
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                validatePhoneNumber(value){
                    if(value && value.length > 0){
                        let regEx = /^[\+0-9]?[\+0-9]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
                        if(!regEx.test(value)){
                            throw new Error('Please provide a phone number in international format. For example: +1(800)000-00-00.');
                        }
                    }
                }
            }
        },
        facebook: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                validateFB(value){
                    if(value && value.length > 0){
                        let regEx = /(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/;
                        if(!regEx.test(value)){
                            throw new Error('Please provide Facebook url of your account.');
                        }
                    }
                }
            }
        },
        twitter: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                validateFB(value){
                    if(value && value.length > 0){
                        let regEx = /(https:\/\/twitter.com\/(?![a-zA-Z0-9_]+\/)([a-zA-Z0-9_]+))/;
                        if(!regEx.test(value)){
                            throw new Error('Please provide Twitter url of your account.');
                        }
                    }
                }
            }
        },
        instagram: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                validateFB(value){
                    if(value && value.length > 0){
                        let regEx = /(https:\/\/instagram.com\/(?![a-zA-Z0-9_]+\/)([a-zA-Z0-9_]+))/;
                        if(!regEx.test(value)){
                            throw new Error('Please provide Instagram url of your account.');
                        }
                    }
                }
            }
        },
        github: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                validateFB(value){
                    if(value && value.length > 0){
                        let regEx = /(https:\/\/github.com\/(?![a-zA-Z0-9_]+\/)([a-zA-Z0-9_]+))/;
                        if(!regEx.test(value)){
                            throw new Error('Please provide GitHub url of your account.');
                        }
                    }
                }
            }
        },
        youtube: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                validateFB(value){
                    if(value && value.length > 0){
                        let regEx = /((http|https):\/\/|)(www.|)youtube\.com\/(channel\/|user\/|)[a-zA-Z0-9]{1,}/;
                        if(!regEx.test(value)){
                            throw new Error('Please provide YouTube url of your account.');
                        }
                    }
                }
            }
        },
        company: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                lenValidate(value){
                    if(value !== undefined && value != null && value.length > 0){
                        if(value.length < 2 || value.length > 150){
                            throw new Error(`The company name should be between 2 and 150 characters must be from 2 to 50 symbols.`);
                        }
                    }
                }
            }
        },
        job_title: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                lenValidate(value){
                    if(value !== undefined && value != null && value.length > 0){
                        if(value.length < 2 || value.length > 150){
                            throw new Error(`The job title should be between 2 and 150 characters must be from 2 to 50 symbols.`);
                        }
                    }
                }
            }
        }
    });
    return UserContacts;
};