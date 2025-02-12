const express = require("express");
const {
  createFeatureAccess
} = require("../controller/featureAccess.js"); 

const FeatureAccess = require("../models/featureAccess.js");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults.js");
const { protect} = require("../middleware/auth.js");

//router.use(protect);
//router.use(authorize("admin"))

router
  .route("/")
  //.get(advancedResults(User),getUsers)
  .post(createFeatureAccess)
  

router
  .route('/:id')
  // .get(getUser)
  // .put(updateUser)
  // .delete(deleteUser)
  

module.exports = router;
