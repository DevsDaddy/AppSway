//=================================================================
//  AppSway User Additional Data Model
//=================================================================
//  @version                0.9.0
//  @developer              DevsDaddy
//  @git                    https://github.com/DevsDaddy/AppSway
//=================================================================
// Define Model
module.exports = function(database, Sequelize, DataTypes) {
    const UserAdditional = database.define('user_additional', {
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
        interests: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        additional_data: {
            type: DataTypes.JSON,
            allowNull: true
        }
    });
    return UserAdditional;
};