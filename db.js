const { mongoose } = require("mongoose");

const mongoUri = process.env.MONGODB_URI; 
const mongoUri2 = process.env.MONGODB_URI2; 

const connection1 = mongoose.createConnection(mongoUri);
const connection2 = mongoose.createConnection(mongoUri2);

connection1.on('connected', () => {
  console.log('Connected to Primary MongoDB!');
});

connection2.on('connected', () => {
  console.log('Secondary MongoDB Connected!');
});

connection1.on('error', (error) => {
  console.error('Primary MongoDB connection error:', error.message);
});

connection2.on('error', (error) => {
  console.error('Secondary MongoDB connection error:', error.message);
});

module.exports = {
  connection1,
  connection2
};