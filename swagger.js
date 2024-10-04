const swaggerAutogen = require('swagger-autogen')();
const doc = {
  info: {
    title: 'Contacts Project API',
    description: 'API Documentation'
  },
  host: `localhost:3000`,
  schemes: ['http', 'https']
  // host: "cse-341-contacts-eeak.onrender.com",
  // schemes: ['https']
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
