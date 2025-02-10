const rnd_sessionId = require('../utils/randomSessionId');

const messageSchema = new mongoose.Schema({
  sessionId: String,
  role: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

messageSchema.pre("save", async function (next) {
this.sessionId = rnd_sessionId
});

module.exports = mongoose.model("Message", messageSchema);
