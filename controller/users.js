const User = require("../models/users");
const encrypt = require("../utils/password");

exports.createUser = async (req, res, next) => {
    try {
        console.log(req.body);
        const { name, email, password } = req.body;

        let hashPassword = encrypt(password);

        await User.create({
            name,
            email,
            password,
        });

        res.status(200).json({ success: true });
    } catch (err) {
        let errmsg = "";
        if (err.name == "ValidationError") {
            const errFields = [];

            // Loop through the errors and collect the names of required missing fields
            Object.keys(err.errors).forEach((field) => {
                if (err.errors[field].kind === "required") {
                    //Identify type of vaildation error
                    errFields.push(
                        field.charAt(0).toUpperCase() + field.slice(1),
                    ); //Cap first letter of field
                }
            });

            // If there are error fields, create the message
            if (errFields.length > 0) {
                const lastField = errFields.pop(); // Get the last field
                errmsg =
                    errFields.length > 0
                        ? `${errFields.join(", ")} and ${lastField} are required`
                        : `${lastField} is required`;
            }
        }
        res.status(400).json({ success: false, error: errmsg });
    }
};

exports.getAllUsers = async (req, res, next) => {
    data = await User.find();

    res.status(200).json({
        success: true,
        data,
    });
};

exports.updateUser = async (req, res, next) => {
    let user = await User.findByIdAndUpdate(req.params.userid, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: user,
    });
};

exports.deleteUser = async (req, res, next) => {
    await User.findOneAndDelete({ id: req.params.id }).then(function (val) {
        res.status(200).json({
            success: true,
        });
    });
};
