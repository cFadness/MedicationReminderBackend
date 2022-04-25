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
      medications: req.body.medications,
      pharmacyInfo: req.body.pharmacyInfo
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
        pharmacyInfo: user.pharmacyInfo
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

//* DELETE your own account
router.delete("/", [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(400)
        .send(`User with id ${req.user._id} does not exist!`);
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

//* DELETE a medication
router.delete("/medications/:medId", [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(400)
        .send(`User with id ${req.user._id} does not exist!`);
    
    let tempMedications = user.medications.filter((med) => {
      if(med._id != (req.params.medId)){
        return true
      }
      else{
        return false
      }
    })
    user.medications = tempMedications

    await user.save();
    return res.send(user);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//*Edit a medication
router.put('/medications/:medId', [auth], async (req, res) => {
  try {
      // const user = await User.findById(req.user._id);
      // let updatedMeds = user.medications.map((med) => {
      //   if(med._id == (req.params.medId)){
      //     med = {
      //       ...med,
      //       ...req.body
      //     }
      //   }
      //   return med
      // })

      // const updatedUser = await User.findOneAndUpdate({"_id": req.user._id, "medications._id": req.params.medId}, 
      //   {
      //     "$set": {
      //       "medications.$": {
      //         ..."medications.$",
      //         ...req.body
      //       }
      //     }
      //   },
      //   { new: true }
      // );

      const user = await User.findById(req.user._id)

      if (!user)
        return res.status(400).send(`The userId "${req.user._id}" does not exist.`);

      const medication = user.medications.id(req.params.medId)

      if (!medication)
        return res.status(400).send(`The medicationId "${req.params.medId}" does not exist.`);

      medication.set(req.body)

      await user.save();
      return res.send(user);
  } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* GET pharmacy info by userID
router.get('/pharmacyInfo', [auth], async (req, res) => {
  try {
      const user = await User.findById(req.user._id);
      const pharmacyInfo = user.pharmacyInfo
      return res.send(pharmacyInfo);
  } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//*Edit pharmacy info
router.put('/pharmacyInfo', [auth], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, 
      {
        pharmacyInfo: {
          name: req.body.name,
          address: req.body.address,
          phoneNumber: req.body.phoneNumber
        }
      },
        { new: true }
        );

        if (!user)
            return res.status(400).send(`The userId "${req.user._id}"
            does not exist.`);
      
        await user.save();

        return res.send(user);
} catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
}
});

module.exports = router;
