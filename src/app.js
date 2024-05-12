const express = require('express')
const morgan = require('morgan')
const {userRouter} = require('./routes/user')
const bodyParser = require('body-parser')
const cors = require('cors');

// logging middleware for development
const {loggingRequest} = require('./middleware/loggingMiddleware')

const cookieParser = require('cookie-parser');




// Create Express App
const app = express()
// Allow requests from localhost
app.use(cors({
    origin: 'http://localhost:3000', // Update with your frontend URL
    credentials: true
}));


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




// app.use(loggingRequest)
// for development
app.use(morgan('combined'))
// User related routes
app.use(userRouter)




// configure logging middle ware
app.get('/hello', (req, res) => {
    console.log('cookies: ', req.cookies)
    res.send('Hello, World!');
});

app.get('/set', (req, res) => {
    res.cookie('name', 'value')
    res.cookie('name2', 'value3')
    res.cookie('name3', 'kfsdksdf')
    res.send('Hello, World!');
});

app.use('/', (req, res)=>{
    res.send('<h1>Testing...</h1>')
})

// for testing 
module.exports = app

app.listen(process.env.PORT || 1000,()=>console.log('Server is listing')) ;