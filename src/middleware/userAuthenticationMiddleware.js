const {
  sendBadRequestResponse,
  sendUnAuthorized
} = require("../utils/responseHandler"); // Importing response handling functions
const { isValidToken } = require("../utils/jwtUtil"); // Importing token validation function

// Middleware to validate the request for OTP validation endpoint - forgot password
// Expects 'email' request body
module.exports.validateOTPRequest = (req, res, next) => {
  const { email } = req.body;  
  if (!email) {
    // If 'email' is missing, send a Bad Request response
    return sendBadRequestResponse(res);
  }
  next();
};

// Middleware to validate user data for sign-up
module.exports.validateUserData = (req, res, next) => {  
  const { name, mobile, password, email,  otp } = req.body;
  if (    
    !name ||
    !email ||
    !mobile ||
    !password ||
    !otp
  ) {
    // If any of the required fields are missing, send a Bad Request response
    return sendBadRequestResponse(res);
  }
  next();
};

// Middleware to validate user password and otp for UPDATE password
module.exports.validateUpdatePasswordData = (req, res, next) => {  
  const {  password, email,  otp } = req.body;
  if (        
    !email ||
    !password ||
    !otp
  ) {
    // If any of the required fields are missing, send a Bad Request response
    return sendBadRequestResponse(res);
  }
  next();
};

// Middleware to validate login data
module.exports.validateLoginData = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // If 'email' or 'password' is missing, send a Bad Request response
    return sendBadRequestResponse(res);
  }
  next();
};

// Middleware to authenticate requests using JWT token
module.exports.authenticate = async (req, res, next) => {
  const cookies = req.cookies 
  const access_token =  cookies ? cookies.access_token : None
  
  console.log('access_token: ', access_token)
  if (!access_token) {
    // If token is missing, send a Bad Request response
    return sendBadRequestResponse(res);
  }
  
  if (!await isValidToken(access_token)) {
    // If the token is invalid, send an Unauthorized response
    return sendUnAuthorized(res, "Invalid Token");
  } else {
    next(); // Proceed to the next middleware or route handler if token is valid
  }
};
