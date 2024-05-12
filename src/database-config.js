const { Sequelize } = require("sequelize");
require("dotenv").config();



console.log(process.env.NODE_ENV)
const databaseUrl = process.env.NODE_ENV == 'development' ? process.env.DATABASE_LOCAL_URL  : process.env.DATABASE_URL;

console.log(databaseUrl)
// Initialize Sequelize with the database URL
const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres", 
  logging:false
});


module.exports.sequelize = sequelize;
