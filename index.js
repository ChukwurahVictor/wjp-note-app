const http = require('http');
const path = require('path');
const fs = require('fs');

const parseNote = function (request, callback) {
   let title = '';
   let category = '';
   let note = '';
   
   request.on('data', (chunk) => {
      title += chunk.toString();
      category += chunk.toString();
      note += chunk.toString();
   });
   
   request.on('end', () => {
      callback(JSON.parse(title));
      callback(JSON.parse(category));
      callback(JSON.parse(note));
   });
};

const requestListener = function (req, res) {
   if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200);
      res.end('Go to /add - to add a note or /read - to read a note');
   }
   if (req.url === '/add' && req.method === 'POST') {
      res.writeHead(200);
      parseNote(req, (result) => {
         let baseDir = path.join(__dirname, `/topics/${result.category}`);
         fs.writeFile(`${baseDir}/${result.title}.txt`, result.note, function (err) {
               if (err) return console.log(err);
               res.end(`"${result.title}" has been saved in "${result.category}" directory`);
         });
      });
   }

   if (req.url === '/read' && req.method === 'POST') {
      res.writeHead(200);
      parseNote(req, (result) => {
         let baseDir = path.join(__dirname, `/topics/${result.category}/${result.title}.txt`);
         fs.readFile(`${baseDir}`, 'utf8', function (err,data) {
            if (err) {
              return console.log(err);
            }
            res.end(data);
         });
      });
   }

   if (req.url === '/delete' && req.method === 'POST') {
      res.writeHead(200);
      parseNote(req, (result) => {
         let baseDir = path.join(__dirname, `/topics/${result.category}/${result.title}.txt`);
         fs.unlink(`${baseDir}`, function (err) {
            if (err) throw err;
            console.log('File deleted!');
          });
      });
   }
};

const server = http.createServer(requestListener);

const port = 3000;

server.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});