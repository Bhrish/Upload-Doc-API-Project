const bcrypt = require('bcryptjs');

const authCode = 'BhrishAuthorization';
const salt = 10
const hashedUserAuthcode = bcrypt.hashSync(authCode, salt);
console.log(hashedUserAuthcode);
