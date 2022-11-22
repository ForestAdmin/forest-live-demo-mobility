const express = require('express');
const requireAll = require('require-all');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('express-jwt');
const morgan = require('morgan');
const {
  errorHandler,
  ensureAuthenticated,
  PUBLIC_ROUTES,
} = require('forest-express-sequelize');

const app = express();

app.use((req, res, next) => {
  req.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIzNjk1IiwiZW1haWwiOiJzdGV2ZWJAZm9yZXN0YWRtaW4uY29tIiwiZmlyc3ROYW1lIjoiU3RldmUiLCJsYXN0TmFtZSI6IkJ1bmxvbiIsInRlYW0iOiJPcGVyYXRpb25zICIsInJvbGUiOiJBZG1pbiIsInRhZ3MiOltdLCJyZW5kZXJpbmdJZCI6MTE0NTk3LCJpYXQiOjE2NDI3NjA1Mjl9.pEsxmJCCTMYHHQVGi70OkJFk7GdCQQTHqyN3VVtpkBs';
  next();
});

let allowedOrigins = [/\.forestadmin\.com$/, /localhost:\d{4}$/];

if (process.env.CORS_ORIGINS) {
  allowedOrigins = allowedOrigins.concat(process.env.CORS_ORIGINS.split(','));
}

const corsConfig = {
  origin: allowedOrigins,
  maxAge: 86400, // NOTICE: 1 day
  credentials: true,
};

app.use(morgan('tiny'));
app.use('/forest/authentication', cors({
  ...corsConfig,
  // The null origin is sent by browsers for redirected AJAX calls
  // we need to support this in authentication routes because OIDC
  // redirects to the callback route
  origin: corsConfig.origin.concat('null')
}));
app.use(cors(corsConfig));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(jwt({
  secret: process.env.FOREST_AUTH_SECRET,
  credentialsRequired: false,
  algorithms: ['HS256'],
}));

app.use('/forest', (request, response, next) => {
  if (PUBLIC_ROUTES.includes(request.url)) {
    return next();
  }

  if (request.method !== 'GET'
      && !request.originalUrl.startsWith('/forest/stats')
      && !request.originalUrl.includes('/hooks/load')
      && !request.originalUrl.includes('/hooks/change')
  ) {
    const errorMessage = 'You can only read data on this public demo application.';

    if (request.originalUrl.startsWith('/forest/actions/')) {
      return response.status(400).send({ error: errorMessage });
    }

    return response.status(403).send(errorMessage);
  }

  return ensureAuthenticated(request, response, next);
});

requireAll({
  dirname: path.join(__dirname, 'routes'),
  recursive: true,
  resolve: (Module) => app.use('/forest', Module),
});

requireAll({
  dirname: path.join(__dirname, 'middlewares'),
  recursive: true,
  resolve: (Module) => Module(app),
});

app.use(errorHandler());

module.exports = app;
