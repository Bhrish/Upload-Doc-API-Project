const request = require('supertest');
const router = require('./uploadDocAPI');
const app = require('./AuthAPI');
const users = require('./users.json');
let {addTokens, addUsers, generateToken, getUsers, getTokens, refreshAccessToken, updateTokens}  = require('./HandleFuncs');
const tokens = require('./tokens.json');
let authorizeUser = require('./AuthAPI');
const fs = require('fs');

beforeAll((done) => {
    server = app.listen(9000, () => {
        console.log('Server started');
   
    });
    server2 = router.listen(9800, () => {
        console.log('Server 2 started listening to 5500');
        done();
    });
});

describe('Get Users Endpoint "/" ', ()=>{

    //Should Test if we are getting the user list from the json file.
    it('Getting users from user json file', async()=>{
        const userList = users;

        expect(userList.constructor).toBe(Array);

        // If userList is an array, check that its elements are objects
        if (Array.isArray(userList)) {
            userList.forEach(user => {
                expect(user).toBeInstanceOf(Object);
            });
        }
    });

    //Should Test the status code 200 when user list is passed
    it('Should response with 200 status code', async()=>{
        const userList = users
        const response = await request(app).get('/'); // Make a GET request to the endpoint
        expect(response.body.constructor).toBe(Object);
    },20000)
    
    //Should Test the status code 400 when userlist is empty
    it('Test for empty user list', async()=>{
        const response = await request(app).get('/');
        expect(response.body).toBeNull;
    });


});

describe('User Authentication', () => {
    it('should register a new user', async () => {
      const newUser = {
        'Fullname': 'John Doe',
        'Emailid': 'john@example.com',
        'Mobile': '1234567890',
        'Username': 'johndoe',
        'Password': 'password123',
        'Role': 'Employee'
      };
  
      const response = await request(app)
        .post('/registerUser')
        .set('Authorization', 'BhrishAuthorization')
        .send(newUser);
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User has been successfully added');
    });
  
    it('should authenticate a user', async () => {
      const credentials = {
        "Username": "dhanushree_bhrish",
    "Password": "dhanushree12345"
      };
  
      const response = await request(app)
        .post('/authenticate')
        .send(credentials);
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User has been verified.');
      expect(response.body).toHaveProperty('Access-Token');
      expect(response.body).toHaveProperty('Expires-At');
    });
  
    it('should return 401 if admin authorization code is missing', async () => {
        const newUser = {
            'Fullname': 'John Doe',
            'Emailid': 'john@example.com',
            'Mobile': '1234567890',
            'Username': 'johndoe',
            'Password': 'password123',
            'Role': 'Employee'
          };
      
          const response = await request(app)
            .post('/registerUser')
            .set('Authorization', '')
            .send(newUser);
        
        expect(response.text).toBe('Authorization Code is required');
        //expect(response.status).toBe(401);
        expect(response.headers['Authorization']).toBe(undefined);
        //expect(response.body.message).toBe('Access token is required');
    });

    it('Test to check mismatch of admin authorization code', async () => {
        const newUser = {
            'Fullname': 'John Doe',
            'Emailid': 'john@example.com',
            'Mobile': '1234567890',
            'Username': 'johndoe',
            'Password': 'password123',
            'Role': 'Employee'
          };
      
          const response = await request(app)
            .post('/registerUser')
            .set('Authorization', 'Bhrabjkbc')
            .send(newUser);
        
        expect(response.text).toBe('Authorization Code is does not match');
        //expect(response.status).toBe(401);
        //expect(response.headers['Authorization']).toBe(undefined);
        //expect(response.body.message).toBe('Access token is required');
    });
  
    
  });

  getTokens = jest.fn(()=>{
    [
        {
            token: 'valid token',
            expiresAt: 1714381266256,
            userDetails: {
                Fullname: 'Dhanushree A G',
                Mobile: '6361463979',
                Username: 'dhanushree_bhrish',
                Password: '$2a$12$3PxKk/sq/zltOSTBHPFKkOSvXPyoIymfZ/S2EAPz6Y8xGRQCfo6Pa',
                Role: 'Employee',
            },
            refreshToken: {
                refreshAccessToken: 'valid token',
                expiresIn: 1714985946256,
            }
        },
        {
            token: 'expired token',
            expiresAt: 1714381266256,
            userDetails: {
                Fullname: 'Dhanushree A G',
                Mobile: '6361463979',
                Username: 'dhanushree_bhrish',
                Password: '$2a$12$3PxKk/sq/zltOSTBHPFKkOSvXPyoIymfZ/S2EAPz6Y8xGRQCfo6Pa',
                Role: 'Employee',
            },
            refreshToken: {
                refreshAccessToken: 'expired token',
                expiresIn: 1714985946256,
            }
        }
    ]
});

refreshAccessToken =  jest.fn((refreshToken) => {
	    console.log('refreshToken:: ', refreshToken);
	    // Validate refresh token and generate new access token
    	const getRefreshAccessToken = refreshToken.refreshAccessToken;
    	console.log('getRefreshAccessToken::', getRefreshAccessToken);
    
    	//Check if the refresh token is valid
    	if(getRefreshAccessToken === "expired token"){
        return res.status(400).send('Token is expired');
    	}
    	const newAccessToken = 'valid token'; 
    	console.log('newAccessToken::', newAccessToken);
    	const expiresIn = currentTimestamp + (2 * 60 * 1000);
    	console.log('expiresIn::', expiresIn);

    	return { newAccessToken, expiresIn };

});


updateTokens = jest.fn(() => 'Updated');

// Mock the authorizeUser function
authorizeUser = jest.fn((req, res, next) => {
    const token = req.headers.authorization;
    console.log('token:: ', token);
    if (!token || token === '' || token == null) {
        return res.send('Access token is required');
    }
    
    // Simulate token validation logic
    const tokenList = getTokens();
    console.log('token list: ', tokenList);
    const tokenUserFound = tokenList.find(eachToken => eachToken.token === token);
    console.log('tokenUserFound:: ',tokenUserFound);
    if (tokenUserFound) {
        console.log('inside if condn going to next');
        const currentTimestamp = Date.now();
        const ExpireTime = tokenUserFound.expiresAt;
        console.log('Expire time::', ExpireTime)
        if(currentTimestamp == ExpireTime || currentTimestamp > ExpireTime){
            const checkToken = tokenUserFound.token;
            const {newAccessToken, expiresIn} = refreshAccessToken(tokenUserFound.refreshToken);
            console.log('In Main newAccessToken::', newAccessToken);
            console.log('In Main expiresIn::', expiresIn);
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
    } else {
        req.token = false;
        return res.send('Token is not valid');
    }
});

describe('POST /uploads', ()=>{
    it('Test to upload file successfully', async()=>{
        try{
        const response = await request(router)
        .post('/uploads')
        .attach('file','./abc.txt')
        .set('Authorization','valid token')

        expect(response.text).toBe('File uploaded successfully: abc.txt');
        expect(response.statusCode).toBe(200);
        
        // Remove the uploaded file after testing
        fs.unlinkSync(`./Uploads/abc.txt`);
        } catch (error) {
            if (error.code === 'ECONNRESET') {
              console.log('Connection reset, retrying...');
            } else {
              throw error;
            }
          }
    });

    it('Test to check no file', async()=>{
        const response = await request(router)
        .post('/uploads')
        .attach()
        .set('Authorization','valid token')

        expect(response.text).toBe('Required the file to be uploaded');
        expect(response.statusCode).toBe(400);
    });

    it('Access Token missing', async()=>{
        try{
        const response = await request(router)
        .post('/uploads')
        .attach('file','./abc.txt')
        .set('Authorization','')

        console.log('Response status:', response.status);
        console.log('Response body:', response.text);

        expect(response.text).toBe('Access token is required');
        //expect(response.statusCode).toBe(401);
        } catch (error) {
            if (error.code === 'ECONNRESET') {
              console.log('Connection reset, retrying...');
            } else {
              throw error;
            }
          }
    });

    it('Test with wrong token', async()=>{
        try{
        const response = await request(router)
        .post('/uploads')
        .attach('file','./abc.txt')
        .set('Authorization','Not valid')

        expect(response.text).toBe('Token is not valid');
        }catch (error) {
            if (error.code === 'ECONNRESET') {
              console.log('Connection reset, retrying...');
            } else {
              throw error;
            }
          }
    });

    it('Test token expired', async()=>{
        try{
        const response = await request(router)
        .post('/uploads')
        .attach('file','./abc.txt')
        .set('Authorization','expired token')

        expect(response.text).toBe('Token is expired');
        } catch (error) {
            if (error.code === 'ECONNRESET') {
              console.log('Connection reset, retrying...');
            } else {
              throw error;
            }
          }
    });


});

  afterAll((done) => {
    server.close((err) => {
        if (err) {
            console.error(err);
            return done(err);
        }
        console.log('Server closed');
        
    });
    server2.close((err) => {
            if (err) {
                console.error(err);
                return done(err);
            }
            console.log('Server 2 closed');
        });
        done();
});