const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log('ENV: ', process.env.NODE_ENV);
// console.log('USER: ', process.env.USER);
const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB)
  .then((con) => {
    console.log('db connection successful! 😎 \n');
  })
  .catch((err) => console.log('db connection failed 😡'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
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
