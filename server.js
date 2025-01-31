const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

console.log('ENV: ', process.env.NODE_ENV);
// console.log('USER: ', process.env.USER);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
  console.log('🙌');
});
