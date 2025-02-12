const mongoose = require('mongoose');

const featureAccessSchema = new mongoose.Schema({
  role: {
     type: String, 
     enum: ['guest','user','admin','dev'] ,
     required: [true, "Please select a role"],
    },
  features: {
    text:{
      allowed: { type: Boolean, default: true },
      requiresSubscription: {  
        type: String,
        enum: ["none","arke free","arke pro"],
        default: "none"
      }   
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
      contextWindow: {
        type:String,
        enum:["8K","32K","128K"],
        default:"32K"
      },
      conversationHistoryDays:{
        type:Number,
        enum:[0,30,9999],
        default:30
      },
  }
});

module.exports = mongoose.model('FeatureAccess', featureAccessSchema);