const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'production') {
  dotenv.config();
} else {
  dotenv.config({ path: '.env.development' }); 
}

const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.1' });

let host = "";
let protocol = "";
let schemes = [];

console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);

if (process.env.NODE_ENV === 'production') {
  host = "cse-341-project2-z2xo.onrender.com";
  protocol = "https";
  schemes = ['https'];
  console.log('Running in production mode');
} else {
  host = "localhost:3000";
  protocol = "http";
  schemes = ['http'];
  console.log('Running in development mode');
}


const doc = {
  host: host,
  schemes: schemes,
  info: {
    title: 'Project 2: Categories and Products',
    description: `    
  This API provides various endpoints for accessing resources. 
  Please note the following important information regarding authentication:

  - **Authentication Required**: Endpoints marked with a padlock icon are restricted and can only be accessed after logging in via GitHub using OAuth.
  - **OAuth Login:** The authentication is handled via GitHub OAuth. To connect, use the following endpoints:
    - **Login**: [${host}/login](${protocol}://${host}/login) - Initiates the OAuth process with GitHub. Once authenticated, you will gain access to all protected endpoints.
    - **Logout**: [${host}/logout](${protocol}://${host}/logout) - Ends your session and disconnects from GitHub.

    Make sure to log in using the specified route to utilize all available endpoints.
    `
  },
  components: {
    securitySchemes: {
      oAuthSecurity: {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://github.com/login/oauth/authorize',
            tokenUrl: 'https://github.com/login/oauth/access_token',
            scopes: {
              read: 'read your data',         
              write: 'modify data in your account',             
            },
          }
        }
      },
    }
  }
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
