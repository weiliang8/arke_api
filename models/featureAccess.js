const mongoose = require('mongoose');

const featureAccessSchema = new mongoose.Schema({
  roles: [{ type: String, enum: ['guest','user','admin','dev'] }],
  features: {
    text:{
      allowed: { type: Boolean, default: true },
      requiresSubscription: {  
        type: String,
        enum: ["none","arke free","arke pro"],
        default: "none"}   
     },
    docUpload: {
      allowed: { type: Boolean, default: false },
      requiresSubscription: {
        type: String,
        enum: ["none","arke free","arke pro"],
        default: "arke free"}
    },
    imageUpload: {
        allowed: { type: Boolean, default: false },
        requiresSubscription: {  
          type: String,
          enum: ["none","arke free","arke pro"],
          default: "arke pro"}
      },
      conversationHistoryDays:{
        type:Integer,
        default:[0,30,9999]
      },
    tokenLimit: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('FeatureAccess', featureAccessSchema);