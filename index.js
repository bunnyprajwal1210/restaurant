const http = require('http');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { parse } = require('querystring');

const hostname = '127.0.0.1';
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/UserData', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database Connected");
  })
  .catch(() => {
    console.log("Error");
  });

const User = require("./user");

let htmlfile = '';
let cssfile = '';
let jsfile = '';

async function uptodate() {
  try {
    htmlfile = await fs.readFile('./index.html', 'utf8');
    cssfile = await fs.readFile('./style.css', 'utf8');
    jsfile = await fs.readFile('./app.js', 'utf8');
  } catch (err) {
    console.error(err);
  }
}

uptodate();

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;

  if (req.method === 'POST' && req.url === '/') {
    let body = '';
    
    // Read and parse the request body
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const userData = parse(body);
        const data = new User(userData);
        await data.save();
        res.setHeader('Content-Type', 'text/plain');
        res.end('Registration Successful !!');
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error: ' + error.message);
      }
    });
  } else if (req.url.includes('.css')) {
    res.setHeader('Content-Type', 'text/css');
    res.end(cssfile);
  } else if (req.url.includes('.js')) {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(jsfile);
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.end(htmlfile);
    await uptodate(); // Update content when serving HTML
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at :${port}/`);
});
