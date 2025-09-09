const mongoose = require("mongoose");

/**
 * User schema definition.
 *
 * Represents application users stored in MongoDB.
 * Includes authentication fields and automatic timestamps.
 */
const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true }, // Nombre
    lastName: { type: String, required: true }, // Apellidos
    age: { type: Number, required: true, min: 0 }, // Edad
    email: { type: String, required: true, unique: true }, // Correo electrónico
    password: { type: String, required: true },
    resetPasswordToken: { type: String }, //Para el recover-password
    resetPasswordExpires: { type: Date }
  },
  {
    timestamps: true,
  },
);

/**
 * Mongoose model for the User collection.
 * Provides an interface to interact with user documents.
 */
module.exports = mongoose.model("User", UserSchema);
