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

app.get('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  if (id > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'invalid id' });
  }

  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'no tour found' });
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
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
});

app.patch('/api/v1/tours/:id', (req, res) => {
  //
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'no tour found' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour here...>',
    },
  });
});

app.delete('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'no tour found' });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
