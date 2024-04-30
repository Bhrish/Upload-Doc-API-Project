const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
let tokens = require('./tokens.json');
const authorizeUser = require('./AuthAPI');
//const {getTokens, refreshAccessToken, updateTokens}  = require('./HandleFuncs');
  
const router = express();
router.use(bodyParser.json());
const PORT = process.env.PORT_NUMBER || 5500;

console.log('upload port:', PORT)
console.log('upload checked');

   
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
router.post('/uploads', async(req, res) => {
    authorizeUser(req, res, () => {
      upload.single('file')(req, res, err => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send('Error uploading file');
        } else if (err) {
            return res.status(500).send('Internal server error');
        }
      });
      
    });
});


// router.listen(PORT, ()=>{
//     console.log(`Listening to the port : ${PORT}`);
// });

module.exports = router;