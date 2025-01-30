const fs = require('fs');

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

exports.getAllTour = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours: tours },
  });
};

exports.getTour = (req, res) => {
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

exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
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

exports.deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'no tour found' });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
