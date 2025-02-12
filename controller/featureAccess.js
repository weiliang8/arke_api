const featureAccess = require("../models/featureAccess");
const asyncHandler = require("../middleware/async");

exports.createFeatureAccess = asyncHandler(async (req, res, next) => {
        const { role, features} = req.body;

        await featureAccess.create({
            role,
            features,
        });

        res.status(200).json({ success: true });
    
});