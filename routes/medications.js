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

module.exports = router;