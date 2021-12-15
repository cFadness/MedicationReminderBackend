const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const medicationSchema = new mongoose.Schema(
  {
      name: { type: String, required: true, minLength: 2, maxLength: 50 },
      strength: {
        number: { type: String, required: true, minLength: 1 },
        measurement: { type: String, required: true }
      },
      dose: {
        number: { type: String, required: true, minLength: 1 },
        form: { type: String, required: true }
      },
      frequency: { type: String, required: true, minLength: 1 },
      quantity: { type: String, required: true, minLength: 1 },
      refills: { type: String, required: true, minLength: 1 },
      dateCreated: { type: Date, default: Date()}
  }
)

const userSchema = mongoose.Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 50 },
  email: {
    type: String,
    unique: true,
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  password: { type: String, required: true, minLength: 8, maxLength: 1024 },
  medications: { type: [medicationSchema], default: [] }
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    config.get("JWT_SECRET")
  );
};

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required()
  });
  return schema.validate(user);
};

const validateLogin = (req) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(req);
};

const User = mongoose.model("User", userSchema);
module.exports.User = User;
module.exports.userSchema = userSchema;
module.exports.validateUser = validateUser;
module.exports.validateLogin = validateLogin;
