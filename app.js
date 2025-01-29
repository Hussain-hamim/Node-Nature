const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

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

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    './dev-data/data/tours-simple.json', // path
    JSON.stringify(tours), // data - in this new tours we added the new tours
    (err) => {
      //and we send back the client this response
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );

  //   res.send('done');
});

const port = 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
