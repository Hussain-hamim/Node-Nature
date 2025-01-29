const express = require("express");

const app = express();

// app.get("/", (req, res) => {
//   res.json({ message: "hello from server", app: "nodejs" });
// });

// app.post("/", (req, res) => {
//   //
//   res.status(200).send("you can send to this endpoint");
// });

app.get("/api/v1/tours", (req, res) => {
  //
});

const port = 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
