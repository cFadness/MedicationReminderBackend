const { User, Medication, validateMedication, validateLogin, validateUser } = require("../models/user");

const auth = require("../middleware/auth");

const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

//* POST register a new user
router.post("/register", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send(`Email ${req.body.email} already claimed!`);

    const salt = await bcrypt.genSalt(10);
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt),
      medications: req.body.medications
    });

    await user.save();
    const token = user.generateAuthToken();
    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send({
        _id: user._id,
        name: user.name,
        email: user.email,
        medications: user.medications,
      });
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});
//* POST a valid login attempt
//! when a user logs in, a new JWT token is generated and sent if their email/password credentials are correct
router.post("/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send(`Invalid email or password.`);

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid email or password.");

    const token = user.generateAuthToken();
    return res.send(token);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.send(users);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* DELETE a single user from the database
router.delete("/:userId", [auth], async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send(`User with id ${req.params.userId} does not exist!`);
    await user.remove();
    return res.send(user);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* GET user by ID
router.get("/", [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(400)
        .send(`User with id ${req.user._id} does not exist!`);
    return res.send(user);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});







//* GET medications by userID
router.get('/medications', [auth], async (req, res) => {
  try {
      const user = await User.findById(req.user._id);
      const medications = user.medications
      return res.send(medications);
  } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* POST a medication
router.post('/medications', [auth], async (req, res) => {
  try {
      const { error } = validateMedication(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      const user = await User.findById(req.user._id);
      const medication = new Medication(req.body);
      user.medications.push(medication);
      await user.save();
      return res.send(user);

  } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

module.exports = router;
