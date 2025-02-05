const bcrypt = require('bcryptjs');

const encrypt = async (password) => {
  try {
    const salt = await bcrypt.genSalt();
    const encryptPass = await bcrypt.hash(password, salt);
    return encryptPass;
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

async function verify(InputPass,DBPass) {
  const passwordMatched = await bcrypt.compare(InputPass, DBPass);

  if(passwordMatched) {
      console.log('OK: Verification is successful.');
      return true
  }
  else {
      console.error('ERR: Verification failed.');
      return false
  }
}

module.exports = encrypt;