const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonHandler.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCss,
  '/getUsers': jsonHandler.getUsers,
  '/addUser': jsonHandler.addUser,
  '/notReal': htmlHandler.get404,
  notFound: htmlHandler.get404,
};

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);

    handler(request, response);
  });
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
    parseBody(request, response, jsonHandler.addUser);
  }
};

// handle GET requests
const handleGet = (request, response, parsedUrl) => (urlStruct[parsedUrl.pathname]
  ? urlStruct[parsedUrl.pathname](request, response)
  : urlStruct.notFound(request, response));

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  request.query = Object.fromEntries(parsedUrl.searchParams);

  request.acceptedTypes = request.headers.accept.split(',');

  return request.method === 'POST'
    ? handlePost(request, response, parsedUrl)
    : handleGet(request, response, parsedUrl);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on port 127.0.0.1:${port}`);
});
