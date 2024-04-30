const request = require('supertest');
const app = require('./AuthAPI');
const users = require('./users.json');
const {addTokens, addUsers, generateToken, getUsers, getTokens, refreshAccessToken, updateTokens}  = require('./HandleFuncs');
const tokens = require('./tokens.json');
const authorizeUser = require('./AuthAPI');


beforeAll((done) => {
    server = app.listen(9000, () => {
        console.log('Server started');
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

  afterAll((done) => {
    server.close((err) => {
        if (err) {
            console.error(err);
            return done(err);
        }
        console.log('Server closed');
        done();
    });
});