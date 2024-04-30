const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
let tokens = require('./tokens.json');
//const authorizeUser = require('./AuthAPI');
const {getTokens, refreshAccessToken, updateTokens}  = require('./HandleFuncs');
  
const router = express();
router.use(bodyParser.json());
const PORT = 5500;
router.timeout = 100000;

//Authorizating the Upload Document API
const authorizeUser = (req, res, next) => {
    const token = req.headers.authorization;
    console.log('token:', token)
    if (!token || token == '') {
        console.log('inside empty token')
        return res.send('Access token is required');
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
        req.token = true;
        next();
    }else{
        console.log('inside else');
        req.token = false;
        return res.send('Token is not valid');
    }
};
   
// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('inside destination');
      cb(null, './Uploads/'); // Save uploaded files to the 'storeFiles' directory
    },
    filename: function (req, file, cb) {
        console.log('inside the filename');
      cb(null,  file.originalname); // Rename files with timestamp and original extension
    }
});


const upload = multer({ storage: storage });

//route for upload api
router.post('/uploads', authorizeUser, upload.single('file'), async(req, res) => {
    console.log('req::', req.token);
    console.log('req.file::', req.file);
    const tokenStatus = req.token;
    console.log('tokenStatus::', tokenStatus);
    if(!req.file || req.file === undefined){
        res.status(400).send(`Required the file to be uploaded`);
    }
    else{
        res.status(200).send(`File uploaded successfully: ${req.file.originalname}`);
    }
});


// router.listen(PORT, ()=>{
//     console.log(`Listening to the port : ${PORT}`);
// });

module.exports = router;