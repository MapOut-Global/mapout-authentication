require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mapoutRoutes = require('./routes/mapout-routes');
const hrgigRoutes = require('./routes/hrgig-routes');
const socialLoginRoutes = require('./routes/social-login.routes');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9000;

  app.use(bodyParser.json());
  const allowedOrigins = ['https://admin.mapout.com', 'https://dev.admin.mapout.com', 'http://localhost:5173' , 'http://localhost:3000', 'https://mapout-admin-frontend.pages.dev'];
  app.use(cors({ origin: allowedOrigins, credentials: true })); 

  app.use(logger('dev'));

  //Health-check
  app.get('/mapout-authentication',(req,res)=>res.send("Mapout - Authentication"))

  app.use('/mapout-authentication/mapout', mapoutRoutes);
  app.use('/mapout-authentication/hrgig', hrgigRoutes);
  app.use('/mapout-authentication/social-login',socialLoginRoutes)

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
//});
