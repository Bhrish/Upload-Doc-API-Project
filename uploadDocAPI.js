const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const authorizeUser = require('./AuthAPI');
  
const app = express();
app.use(bodyParser.json());
const PORT = 5500;
   
// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('inside destination');
      cb(null, './Uploads/'); // Save uploaded files to the 'storeFiles' directory
    },
    filename: function (req, file, cb) {
        console.log('inside the filename');
      cb(null, Date.now() + path.extname(file.originalname)); // Rename files with timestamp and original extension
    }
});


const upload = multer({ storage: storage });

//route for upload api
app.post('/uploads', authorizeUser, upload.single('file'), async(req, res) => {
    if(!req.file){
        res.status(400).send(`Required the file to be uploaded`);
        
    }else{
        res.status(200).send(`File uploaded successfully: ${req.file.originalname}`);
    }
});


app.listen(PORT, ()=>{
    console.log(`Listening to the port : ${PORT}`);
});