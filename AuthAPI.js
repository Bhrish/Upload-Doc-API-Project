const express = require('express');
const bodyParser = require('body-parser');
let users = require('./users.json');
let tokens = require('./tokens.json');
const {addTokens, addUsers, generateToken, getUsers, getTokens, refreshAccessToken, updateTokens}  = require('./HandleFuncs');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());
const PORT = 9000;

//Displays Users List 
app.get('/', (req,res)=>{
    //const userList = getUsers();
    const userList = users;
    console.log('userlist: ', userList);
    if(!userList){
        res.json({"message":"Unable to fetch the user list"});
    }else{
        res.json({"Users": userList});
    }
    
});

const adminCode = "$2b$10$N/U.rS85cEVxwH/nro3sa.Mvg13WUnkt2WNZRD.Sc0N2Omtleg1N.";

//Registering the User Only By Organization/Admin
const adminAuthorize = (req,res,next)=>{
    console.log(req.headers);
    console.log(req.headers.authorization);
    const authCode = req.headers.authorization;
    console.log(`authCode: ${authCode}`)
    const adminAuthCode = adminCode;
    // const salt = bcrypt.genSaltSync(10);
    // const hashedUserAuthcode = bcrypt.hashSync(authCode, salt);
    // console.log(`hashedUserAuthcode: ${hashedUserAuthcode}`);
    // const hashedAdminAuthCode = bcrypt.hashSync(adminAuthCode, salt);
    // console.log(`hashedAdminAuthCode: ${hashedAdminAuthCode}`);
    const authCodeMatch = bcrypt.compareSync(authCode, adminAuthCode);
    console.log(`match: ${authCodeMatch}`)
    if(authCodeMatch){
        next();
    }else{
        return res.status(401).json({ message: 'Authorization Code is required' });
    }
};

//Route for Registering User
app.post('/registerUser',adminAuthorize, (req,res)=>{
    console.log(req.body);
    const {Fullname, Emailid, Mobile, Username, Password, Role} = req.body;
    //Password Encryption
    //const salt = bcrypt.genSaltSync(12);
    const salt = 12
    const hashedPassword = bcrypt.hashSync(Password, salt);
    console.log(`hashedPassword: ${hashedPassword} `);

    const userData = {
        "Fullname": Fullname,
        "Email": Emailid,
        "Mobile": Mobile,
        "Username": Username,
        "Password": hashedPassword,
        "Role": Role
    }

    const userRegisterStatus = addUsers(userData);
    console.log(`userRegisterStatus: ${userRegisterStatus} `);
    if(userRegisterStatus == "Success"){
        res.status(200).json({"message":"User has been successfully added"})
    }else{
        res.status(400).json({"message":"Unable to add the user"})
    }
});

//Verifying the Credentials by Authenticating and even authorizing the access and then generating the token.
const verifyUserCredentials = (req, res, next)=>{
    const {Username, Password} = req.body;
    console.log(req.body);
    const userDetail = users.find(eachUser => eachUser.Username === Username && bcrypt.compareSync(Password, eachUser.Password));
    console.log('user detail: ', userDetail);

    if(userDetail == null){
        return res.status(400).send(`Invalid credentials.`)
    }else{
        if(userDetail.Role === "Employee"){
            //Access Token
            const access_token = generateToken(32);
            const currentTime = Date.now();
            const token_expiration = currentTime + (2 * 60 * 1000);
            //Refresh token
            const refresh_token = generateToken(32);
            const refreshToken_expiration = currentTime + (7 * 24 * 60 * 60 * 1000);;
            const tokenData = {"token": access_token, "expiresAt": token_expiration, "userDetails": userDetail, "refreshToken": {"refreshAccessToken": refresh_token, "expiresIn": refreshToken_expiration}};

            const TokenStatus = addTokens(tokenData);
            if(TokenStatus == "success"){
                req.accessToken = access_token;
                req.expireTime = token_expiration;
                next();
            }
        }else{
            return res.status(400).send(`Access Denied Only Employee of the organization can access`);
        }
    }
};

//Route for authentication
app.post('/authenticate',verifyUserCredentials, (req, res)=>{
    res.status(200).json({"message": "User has been verified.", "Access-Token":req.accessToken,"Expires-At": req.expireTime});
});


  
//Authorizating the Upload Document API
const authorizeUser = (req, res, next) => {
    const token = req.headers.authorization;
    console.log('token:', token)
    if (!token) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    const tokenList = getTokens();
    console.log('tokenList:', tokenList)
    const tokenUserFound = tokenList.find(eachToken => eachToken.token === token);
    console.log('tokenUserFound:', tokenUserFound)
    if(tokenUserFound){
        console.log('inside if condn going to next');
        const currentTimestamp = Date.now();
        const ExpireTime = tokenUserFound.expiresAt;
        console.log('Expire time::', ExpireTime)
        if(currentTimestamp == ExpireTime || currentTimestamp > ExpireTime){
            //return res.status(400).json({message: 'Token is expired'});

            //Calling Token Refresh Function
            const checkToken = tokenUserFound.token;
            const {newAccessToken, expiresIn} = refreshAccessToken(tokenUserFound.refreshToken);
            console.log('In Main newAccessToken::', newAccessToken);
            console.log('In Main expiresIn::', expiresIn);
            //tokenUserFound.token = newAccessToken;
            //tokenUserFound.expiresAt = expiresIn;
            const updateNewUserToken = updateTokens(checkToken,newAccessToken, expiresIn);
            if(updateNewUserToken == "Updated"){
                console.log('Updated tokenUserFound::', tokenUserFound);
            }else{
                console.log('Else Updated tokenUserFound::', tokenUserFound);
            }

        }
        console.log('going next');
        next();
    }else{
        console.log('inside else');
        return res.status(400).json({ message: 'Token is not valid' });
    }
};  

 
app.listen(PORT, ()=>{
    console.log(`Listening to the port : ${PORT}`);
});

module.exports = authorizeUser;