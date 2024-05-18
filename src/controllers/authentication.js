// Import necessary modules
const { sequelize } = require("../database-config");
const { createUser } = require("../models/user"); // Import createUser function from user model
const { hashPassword, isValidPassword } = require("../utils/passwordUtils"); // Import hashPassword function from passwordUtils
const { createUserOTP, UserSecret } = require("../models/userOTP");
const { sendOTPMail } = require("../services/emailService");
const { User } = require("../models/user");
const { sign } = require("../utils/jwtUtil");
const {
  sendUnAuthorized,
  sendErrorResponse,
  sendConflictResponse,
  sendSuccessResponse,
  sendBadRequestResponse,
} = require("../utils/responseHandler");
const {
  isValidOTP,
  generateSecret,
  generateTOTP,
} = require("../utils/otpUtils");

// Expect{ Email, password}
// Endpoint for user login
module.exports.login = async (req, res) => {
  
  try{    
    const { email, password } = req.body; // Extract email and password from request body
  
    // Get User Email And Hashed Password
    const user = await User.findOne({
      where: {
        email: email,
      },
      attributes: ["email", "password"],
    });


    // If user not found, send unauthorized response
    if (!user) {
      return sendUnAuthorized(res);
    }
  
    // If password is invalid, send unauthorized response
    if (! await isValidPassword(password, user.password)) {
      return sendUnAuthorized(res); // Message: Unauthorized
    } 
    
    
    const access_token = sign({ email: user.email, id: user.id });
    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7 days

    res.cookie('access_token', access_token, {
      maxAge: oneWeekInMilliseconds
    });
    return sendSuccessResponse(res); // Message: Success
  
  }
  catch(error){
    console.log('Error while logging in: Error: ', error)
  }
};


// Expect {Email}
// for Forget Password 
module.exports.OTPForget = async(req, res) => { 

  // Endpoint to send OTP to a given email if email is found 
  let transaction = null
  try {

    transaction = await sequelize.transaction();
    const { email } = req.body; // Extract email from request body    
    const user = await User.findOne({
     where: {
       email: email,
     },
     attributes: ["email"],
   });
   if (!user) {
     // If user not exists, send 200 - for security
     return sendSuccessResponse(res);
   } 
    // Generate secret and OTP, save to the database, and send OTP email
    const secret = generateSecret();
    const generatedOTP = generateTOTP(secret);
    sendOTPMail(email, generatedOTP);
    await createUserOTP(email, secret, transaction);
    await transaction.commit();
    return sendSuccessResponse(res); // Message : Success
  
} catch (error) {
   if (transaction){
     await transaction.rollback();
   }
   console.log(
     "Error while sending email or interacting with database Error:",
     error
   );
   return sendErrorResponse(res, 500); // Message : Server Error
 }
} 

// Expect{ Email}
// For Register 
module.exports.sendOTP = async (req, res) => {
  // Endpoint to send OTP to a given email
  let transaction = null
  try {
    transaction = await sequelize.transaction();
    const { email } = req.body; // Extract email from request body    
    const user = await User.findOne({
      where: {
        email: email,
      },
      attributes: ["email"],
    });
    if (user) {
      // If user already exists, send conflict response
      return sendConflictResponse(res);
    } else {
      // Generate secret and OTP, save to the database, and send OTP email
      const secret = generateSecret();
      const generatedOTP = generateTOTP(secret);
      sendOTPMail(email, generatedOTP);
      await createUserOTP(email, secret, transaction);
      await transaction.commit();
      return sendSuccessResponse(res); // Message : Success
    }
  } catch (error) {
    if (transaction){
      await transaction.rollback();
    }
    console.log(
      "Error while sending email or interacting with database Error:",
      error
    );
    return sendErrorResponse(res, 500); // Message : Server Error
  }
};

// Endpoint for user registration (sign-up)
// Expect{ Email, password , otp, mobile , name}
module.exports.register = async (req, res) => {
  
  

  
  let transaction = null ;

  const { email, password, otp, mobile, name } = req.body; // Extract data from request body
  try {
    transaction =  await sequelize.transaction(); // Await the transaction creation
    const hashedPassword = await hashPassword(password); // Hash the provided password
    // throw new Error('Error Testing')
    const userOtp = await UserSecret.findOne({
      where: {
        email: email,
      },
      attributes: ["email", "OtpSecret"],
    });
    const user = await User.findOne({
      where: {
        email: email,
      },
      attributes: ["email"],
    });

    if (!userOtp) { 
      // If OTP not found, send bad request response
      return sendBadRequestResponse(res);
    }

    if (!isValidOTP(userOtp.OtpSecret, otp) || user) {
      // If OTP is invalid or user already exists, send unauthorized response
      return sendUnAuthorized(res, "Invalid Credentials");
    }
    // Update user secret and save changes
    userOtp.OtpSecret = "";
    userOtp.save();

    // Create user using createUser function from user model within the transaction
    await createUser(name, email, hashedPassword, mobile, transaction);
    transaction.commit();

    return sendSuccessResponse(res); // Message : Success
  } catch (error) {
    if(transaction){
      transaction.rollback()
    }
    console.error("Error happened while creating a new user:", error);
    return sendErrorResponse(res, 500); // Message : Server Error
  }
};


// Logout End Point  - Deletes the Access token from cookies 

module.exports.logout = (req, res)=> { 
  res.cookie('access_token', '')
  sendSuccessResponse(res)
}
