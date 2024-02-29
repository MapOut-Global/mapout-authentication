require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const indexRouter = require('./routes')
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9000;

  app.use(bodyParser.json());
  const allowedOrigins = ['https://admin.mapout.com', 'https://dev.admin.mapout.com', 'http://localhost:5173' , 'http://localhost:3000', 'https://mapout-admin-frontend.pages.dev','https://development.hrgig-webapp.pages.dev','https://hrgig-webapp.pages.dev'];
  app.use(cors({ origin: allowedOrigins, credentials: true })); 

  app.use(logger('dev'));
  app.use('/',indexRouter)
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
//});
