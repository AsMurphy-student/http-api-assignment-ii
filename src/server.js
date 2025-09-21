const http = require('http');
const htmlHandler = require('./htmlResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCss,
  '/getUsers': htmlHandler.get200,
  '/addUser': htmlHandler.get201,
  '/notReal': htmlHandler.get404,
  index: htmlHandler.get404,
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  request.query = Object.fromEntries(parsedUrl.searchParams);

  request.acceptedTypes = request.headers.accept.split(',');

  return urlStruct[parsedUrl.pathname]
    ? urlStruct[parsedUrl.pathname](request, response)
    : urlStruct.index(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on port 127.0.0.1:${port}`);
});
