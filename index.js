const fs = require('fs');
const http = require('http');

//////////////
//FILE

// fs.readFile('./text.txt', 'utf-8', (err, data) => {
//   fs.readFile(`./${data}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2);
//     fs.writeFile('./final.txt', `${data} ${data2}`, 'utf-8', (err) => {
//       console.log('you file has been written');
//     });
//   });
// });

// console.log('will read the file!');

//////////////
//SERVER

const server = http.createServer((req, res) => {
  res.end('hello from the server.');
});

//          port  ,   host
server.listen(8000, '127.0.0.1', () => {
  console.log('listening on port 8000');
});
