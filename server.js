const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

console.log('ENV: ', process.env.NODE_ENV);
// console.log('USER: ', process.env.USER);

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB)
  .then((con) => {
    console.log('db connection successful! 😎 \n');
  })
  .catch((err) => console.log('db connection failed 😡'));

const tourSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'a tour must have a name'] },

  rating: { type: Number, default: 4.5 },
  price: {
    type: Number,
    required: [true, 'a tour must have price'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server   listening on port ${port}`);
});
