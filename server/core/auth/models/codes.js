//=================================================================
//  AppSway Email Codes Model
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
// Define Model
module.exports = function(database, Sequelize, DataTypes) {
    const Codes = database.define('codes', {
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
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "activation"
        },
        valid_for: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
    return Codes;
};