const express = require("express"); // Import the Express framework
const router = express.Router(); // Create an instance of Express Router
const { register, sendOTP, login, logout, OTPForget, changePassword } = require("../controllers/authentication"); // Import userAuth from authService
const {
  validateUserData,
  validateOTPRequest,
  validateLoginData,
  authenticate,
  validateUpdatePasswordData
} = require("../middleware/userAuthenticationMiddleware"); // Import validateUserData middleware from userMiddleware

const {getData} = require('../controllers/Products')

// Define a POST route '/create' - The route is responsible for creating a user
// It utilizes validateUserData middleware and userAuth.createUser controller
router.post("/register", validateUserData, register);

// Define a POST route '/send_otp' - The route is responsible sending OTP throw email if user is not registered
// It utilizes validateOTPRequest middleware and sendOTP controller
router.post("/send_otp", validateOTPRequest, sendOTP);


// Define a Post route /otp - The route is responsible sending OTP throw Email if user is registered
// It utilizes validateOTPRequest middleware and OTPForget controller
router.post("/otp", validateOTPRequest, OTPForget);

// Define a PATCH route /password - The route responsible updating user password
// I utilizes validateUpdatePasswordData middleware for request body validation and changePassword controller 
router.patch("/password", validateUpdatePasswordData, changePassword);


// Define a POST route '/login' - The route handles user login
// It utilizes validateLoginData middleware and userAuth.login controller
router.post("/login", validateLoginData, login);


router.get("/logout", logout);

router.get("/data", authenticate,  getData);

// Define a GET route '/data' - Route used for testing, returns 'data'
// It utilizes the authenticate middleware
router.get("/data", authenticate, (req, res) => {
  res.send('data');
});

// Export the router instance to be used in other files
module.exports.userRouter = router;
