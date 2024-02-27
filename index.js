
const http = require('http');
const https = require('https');

const url = 'https://time.com';

// Function to make a GET request
function makeRequest(url, callback) {
  https.get(url, (response) => {
    let data = '';
    // A chunk of data has been received.
    response.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received.
    response.on('end', () => {
      callback(null, data);
    });
  }).on('error', (error) => {
    callback(error, null);
  });
}

// Create an HTTP server
const server = http.createServer(async (req, res) => {
  if (req.url === '/getTimeStories') {
    try {
     
      makeRequest(url, (error, html) => {
        if (error) {
          console.error(`Failed to retrieve the webpage: ${error.message}`);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

   
        const result = [];

        const regex = /<li class="latest-stories__item">[\s\S]*?<a href="([^"]+)">[\s\S]*?<h3 class="latest-stories__item-headline">([^<]+)<\/h3>/g;

        let match;
        while ((match = regex.exec(html)) !== null) {
          const link =`https://time.com` +  match[1];
          const title = match[2].trim();

          result.push({
            title,
            link,
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    } catch (error) {
      console.error(`Failed to retrieve the webpage: ${error.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Set the server to listen on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
