module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // this .catch(next) will catch any error and let my handler deal with it
  };
};
