const http = require('http');
const https = require('https');

const url = 'https://time.com';
function makeRequest(url, callback) {
  https.get(url, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      callback(null, data);
    });
  }).on('error', (error) => {
    callback(error, null);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    try {
      makeRequest(url, (error, html) => {
        if (error) {
          console.error(`Failed to retrieve the webpage: ${error.message}`);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        const stories = [];

        let currentIndex = 0;
        while ((currentIndex = html.indexOf('<h3 class="latest-stories__item-headline">', currentIndex)) !== -1) {
   
          const titleStartIndex = currentIndex + '<h3 class="latest-stories__item-headline">'.length;
          const titleEndIndex = html.indexOf('</h3>', titleStartIndex);
          const title = html.slice(titleStartIndex, titleEndIndex).trim();
          const linkStartIndex = html.lastIndexOf('<a href="', currentIndex);
          const linkEndIndex = html.indexOf('">', linkStartIndex);
          const link = html.slice(linkStartIndex + '<a href="'.length, linkEndIndex);

          stories.push({ title, link });
          currentIndex = titleEndIndex;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stories));
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

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
