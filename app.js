const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log('hello from middleware ');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

const getAllTour = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours: tours },
  });
};

const getTour = (req, res) => {
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
};

const createTour = (req, res) => {
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
};

const updateTour = (req, res) => {
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
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'no tour found' });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

// app.get('/api/v1/tours', getAllTour);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTour).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
