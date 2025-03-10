/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log('ENV: ', process.env.NODE_ENV);
// console.log('USER: ', process.env.USER);
const DB = process.env.DATABASE_LOCAL; //--> mongodb://localhost:27017/natours

mongoose
  .connect(DB)
  .then((con) => {
    console.log('db connection successful!⚡\n');
  })
  .catch((err) => console.log('db connection failed 😡'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`server listening on port ${port}`);
  // console.log(process.env.NODE_ENV);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
