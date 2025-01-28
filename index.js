const fs = require('fs');

fs.readFile('./text.txt', 'utf-8', (err, data) => {
  fs.readFile(`./${data}.txt`, 'utf-8', (err, data2) => {
    console.log(data2);
    fs.writeFile('./final.txt', `${data} ${data2}`, 'utf-8', (err) => {
      console.log('you file has been written');
    });
  });
});

console.log('will read the file!');
