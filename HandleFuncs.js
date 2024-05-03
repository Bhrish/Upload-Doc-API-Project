//Handle User Functions
const fs = require('fs');
const path = require('path');
let users = require('./users');

const usersFilePath = path.join(__dirname, 'users.json');

function saveUsers(users) {
    const usersJSON = JSON.stringify(users, null, 2);
    fs.writeFileSync(usersFilePath, usersJSON);
}

function getUsers() {
    const usersData = fs.readFileSync(usersFilePath);
    return JSON.parse(usersData);
}

function addUsers(userData){
    const users = getUsers();
    users.push(userData);
    saveUsers(users);
    return "Success";
}

//Generating a Random Token
function generateToken(length) {
    let token = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters.charAt(randomIndex);
    }

    return token;
}

//Handling Token Functions
const tokensFilePath = path.join(__dirname, 'tokens.json');

function saveTokens(tokens) {
    const tokenJSON = JSON.stringify(tokens, null, 2);
    fs.writeFileSync(tokensFilePath, tokenJSON);
}

function getTokens() {
    const tokensData = fs.readFileSync(tokensFilePath);
    return JSON.parse(tokensData); // Parse JSON data into an object
}

function addTokens(tokenData) {
    const tokenList = getTokens();
    tokenList.push(tokenData); 
    saveTokens(tokenList); // Save the updated token list
    return "success";
}

function updateTokens(tokenToUpdate, newToken, newExpire){
    const tokenList = getTokens();
    const tokenIndex = tokenList.findIndex(t => t.token === tokenToUpdate);

    if (tokenIndex !== -1) {
        tokenList[tokenIndex].token = newToken;
        tokenList[tokenIndex].expiresAt = newExpire;
        saveTokens(tokenList);
        
        return "Updated";
    }else{
        return res.send("Couldn't update the token refreshed. Please login to get new access token");
    }
}

// Token refresh function
const refreshAccessToken = (refreshToken) => {
    console.log('refreshToken::', refreshToken);
    // Validate refresh token and generate new access token
    const getRefreshAccessToken = refreshToken.refreshAccessToken;
    console.log('getRefreshAccessToken::', getRefreshAccessToken);
    const getExpireTime = refreshToken.expiresIn;
    console.log('getExpireTime::', getExpireTime);
    

    const currentTimestamp = Date.now();

    //Check if the refresh token is valid
    if(currentTimestamp == getExpireTime || currentTimestamp > getExpireTime){
        return {error: 'Token is expired'};
    }
    const newAccessToken = generateToken(32); 
    console.log('newAccessToken::', newAccessToken);
    const expiresIn = currentTimestamp + (2 * 60 * 1000);
    console.log('expiresIn::', expiresIn);

    return { newAccessToken, expiresIn };
};


//Hash function
async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt with cost factor 10
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

module.exports = {hashPassword, getUsers, getTokens, addUsers, addTokens, generateToken, refreshAccessToken, updateTokens};