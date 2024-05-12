const express = require("express"); // Import the Express framework
const router = express.Router(); // Create an instance of Express Router
const { register, sendOTP, login, logout } = require("../controllers/authentication"); // Import userAuth from authService
const {
  validateUserData,
  validateOTPRequest,
  validateLoginData,
  authenticate,
} = require("../middleware/userAuthenticationMiddleware"); // Import validateUserData middleware from userMiddleware

const {getData} = require('../controllers/Products')

// Define a POST route '/create' - The route is responsible for creating a user
// It utilizes validateUserData middleware and userAuth.createUser controller
router.post("/register", validateUserData, register);

// Define a POST route '/send_otp' - The route is responsible sending OTP throw email
// It utilizes validateOTPRequest middleware and sendOTP controller
router.post("/send_otp", validateOTPRequest, sendOTP);

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
