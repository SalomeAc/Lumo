const mongoose = require("mongoose");

/**
 * User schema definition.
 * 
 * Represents application users stored in MongoDB.
 * Includes authentication fields and automatic timestamps.
 */
const UserSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },      // Nombre
        lastName: { type: String, required: true },       // Apellidos
        age: { type: Number, required: true, min: 0 },    // Edad
        email: { type: String, required: true, unique: true }, // Correo electrónico
        //username: { type: String, required: true, unique: true }, // Nombre de usuario
        password: { type: String, required: true },
    },
    {
        timestamps: true
    }
);

/**
 * Mongoose model for the User collection.
 * Provides an interface to interact with user documents.
 */
module.exports = mongoose.model("User", UserSchema);
