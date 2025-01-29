const fs = require("fs");
const http = require("http");
const url = require("url");
const replaceTemplate = require("./modules/replaceTemplate");
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

const tempOverview = fs.readFileSync(`${__dirname}/template-overview.html`, "utf-8");
const tempCard = fs.readFileSync(`${__dirname}/template-card.html`, "utf-8");
const tempProduct = fs.readFileSync(`${__dirname}/template-product.html`, "utf-8");

const data = fs.readFileSync(`${__dirname}/data.json`, "utf-8");
const dataOjb = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "content-type": "text/html" });

    const cardHtml = dataOjb.map((el) => replaceTemplate(tempCard, el)).join("");

    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardHtml);

    res.end(output);

    // product page
  } else if (pathname === "/product") {
    res.writeHead(200, { "content-type": "text/html" });
    const product = dataOjb[query.id];

    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // api page
  } else if (pathname === "/api") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(data);

    // not found
  } else {
    res.writeHead(404, {
      "content-type": "text/html",
      "my-header": "something of the header",
    });
    res.end("<h1>page not found</h1>");
  }
});

//          port  ,   host
server.listen(8000, "127.0.0.1", () => {
  console.log("listening on port 8000");
});
