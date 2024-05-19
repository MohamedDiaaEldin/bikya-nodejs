// Import necessary modules
const { sequelize } = require("../database-config");
const { createUser } = require("../models/user"); // Import createUser function from user model
const { hashPassword, isValidPassword } = require("../utils/passwordUtils"); // Import hashPassword function from passwordUtils
const { createUserOTP, UserSecret } = require("../models/userOTP");
const { sendOTPMail, sendPasswordChangeConfirmationEmail } = require("../services/emailService");
const { User } = require("../models/user");
const { sign } = require("../utils/jwtUtil");
const {
  sendUnAuthorized,
  sendErrorResponse,
  sendConflictResponse,
  sendSuccessResponse,
  sendBadRequestResponse,
  sendNotFoundResponse
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
    await userOtp.save({transaction});

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

module.exports.changePassword = async(req, res) => { 

  // Endpoint to send OTP to a given email if email is found 
  let transaction = null
  try {

    // Creates New transaction
    transaction = await sequelize.transaction();
    const { email, otp, password } = req.body; // Extract email , password and OTP from request body    
    // selects user with email from the database
    const user = await User.findOne({
     where: {
       email: email,
     },
     attributes: ["id", "password", "name", 'email'],
   });
    
   
   // selects user OTP with email from the database
   const userOTP = await UserSecret.findByPk(email)
   
   // if user or userOTP not found in the database,  return a 404 Not Found Response 
   if (!user || !userOTP ) {
     // If user not exists, send 404
     return sendNotFoundResponse(res);
   } 

  //  if user's OTP is invalid, return a 401 UnAuthorized Response 
   if (! isValidOTP(userOTP.OtpSecret, otp)){ 
    return sendUnAuthorized(res)
   }

   // set user's OTP secret to empty
   userOTP.OtpSecret = ''   
   // Save userOTP within the transaction
    await userOTP.save({transaction})
    
    // Hash New Password
    const hashedPassword = await hashPassword(password)


    // save new hashed password within the transaction
    user.password = hashedPassword 
    await user.save({transaction})

    
    // Commit Changes within the transaction into the database 
    // update user's otp secret and new password 
    await transaction.commit();
    
    // Async Send Password Change Confirmation Email     
    sendPasswordChangeConfirmationEmail(user.email , user.name)

    return sendSuccessResponse(res); // send a 200 success response 
  
} catch (error) {
   if (transaction){
     await transaction.rollback();
   }
   console.log(
     "Error while sending email or interacting with database Error:",
     error
   );
   return sendErrorResponse(res, 500); // send a 500 server error 
 }
} 


