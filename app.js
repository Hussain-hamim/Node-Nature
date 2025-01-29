const express = require('express');
const fs = require('fs');

const app = express();

// app.get("/", (req, res) => {
//   res.json({ message: "hello from server", app: "nodejs" });
// });

// app.post("/", (req, res) => {
//   //
//   res.status(200).send("you can send to this endpoint");
// });

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

app.get('/api/v1/tours', (req, res) => {
  //
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours: tours },
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
