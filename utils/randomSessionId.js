const { v4: uuidv4 } = require("uuid");

const rnd_sessionId = uuidv4().replace(/-/g, "");
console.log(sessionId);

module.exports = rnd_sessionId;
