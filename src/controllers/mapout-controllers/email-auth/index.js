const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const AppEmployer = require("../../../models/mapout/employer");
const { generateAuthorisationToken } = require("../../../services/jwt-service");
const { connectToDatabase } = require('../../../services/mongodb/connection');
const config = require("../../../config/config");

module.exports = {
    signup: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            connectToDatabase(config.MAPOUT_MONGODB_URI);

            const { email, password } = req.body;

            const existingEmployer = await AppEmployer.findOne({ email });
            if (existingEmployer) {
                return res.status(409).json({ message: "Email already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newEmployer = await AppEmployer.create({
                email,
                password: hashedPassword,
            });

            const token = await generateAuthorisationToken({
                employer_id: newEmployer._id,
                email
            });

            res.status(201).json({
                message: "Employer created successfully",
                data: {
                    newEmployer: {
                        email: newEmployer.email,
                    },
                    token,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    signin: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;
            const employer = await AppEmployer.findOne({ email });

            if (!employer) {
                return res.status(404).json({ message: "Employer Not Found!" });
            }

            const passwordMatch = await bcrypt.compare(password, employer.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: "Incorrect Password!" });
            }

            const token = await generateAuthorisationToken({
                employer_id: employer._id,
                email,
            });

            res.status(200).json({
                message: "Login successful",
                data: {
                    employer,
                    token,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};