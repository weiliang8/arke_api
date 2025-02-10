const User = require('../models/User');
const FeatureAccess = require('../models/featureAccess');

async function checkFeatureAccess(userId, featureName) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Get all FeatureAccess entries applicable to the user's roles
  const featureAccesses = await FeatureAccess.find({ roles: { $in: user.roles } });

  // Check if any entry allows the feature
  const allowedAccess = featureAccesses.find(access => access.features[featureName].allowed);
  if (!allowedAccess) return false;

  // Check if subscription is required for the feature
  const requiresSubscription = featureAccesses.some(access => 
    access.features[featureName].requiresSubscription
  );

  if (requiresSubscription) {
    return user.subscription.includes('paid');
  }

  return true;
}

// Middleware for docUpload
const canUploadDoc = async (req, res, next) => {
  try {
    const allowed = await checkFeatureAccess(req.user.id, 'docUpload');
    if (allowed) return next();
    res.status(403).json({ error: 'Access denied. Subscription required.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { canUploadDoc };