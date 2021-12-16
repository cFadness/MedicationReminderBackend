const { Medication, User, validateLogin, validateUser, validateMedication } = require("../models/user");

const auth = require("../middleware/auth");

const express = require("express");
const router = express.Router();

//* GET medications by userID
router.get('/:userId', [auth], async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const medications = user.medications
        return res.send(medications);
    } catch (ex) {
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//* POST a medication
router.post('/', [auth], async (req, res) => {
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