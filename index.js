const fs = require('fs');
const http = require('http');
const url = require('url');

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
  console.log(req.url);
  if (req.url === '/overview') {
    res.end('this is the overView');
  } else if (req.url === '/') {
    res.end('hello from the server home page.');
  } else {
    res.writeHead(404, {
      'content-type': 'text/html',
      'my-header': 'something of the header',
    });
    res.end('<h1>page not found</h1>');
  }
});

//          port  ,   host
server.listen(8000, '127.0.0.1', () => {
  console.log('listening on port 8000');
});
