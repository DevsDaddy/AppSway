//=================================================================
//  AppSway Auth Basic Model
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
// Define Model
module.exports = function(database, Sequelize, DataTypes) {
    const Auth = database.define('auths', {
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
        login: {
            type: DataTypes.STRING,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        },
        from: {
            type: DataTypes.STRING,
            defaultValue: "local",
            allowNull: false
        },
        last_login: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
    return Auth;
};