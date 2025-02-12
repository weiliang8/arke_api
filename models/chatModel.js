const mongoose = require('mongoose');

const ChatModelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
  });

  module.exports = mongoose.model('chatModel', ChatModelSchema);