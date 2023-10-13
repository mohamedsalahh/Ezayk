const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const boom = require('@hapi/boom');
const helmet = require('helmet');

const { connectToSocketIo, initSocketIoConnection } = require('./config/socket.io');
const { env, constants } = require('./config/constants');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const groupRoutes = require('./routes/group.route');
const { rootDir } = require('./utils/files-paths');
const logger = require('./config/logger');
const rateLimiterMiddleware = require('./middlewares/rateLimiter.middleware');

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('trust proxy', 1);

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(rateLimiterMiddleware);

app.use(express.static(path.join(rootDir, 'public')));
app.get('/profiles-images/*', (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'profiles-images', constants.DEFAULT_USER_IMAGE));
});
app.get('/groups-images/*', (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'groups-images', constants.DEFAULT_GROUP_IMAGE));
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);

app.use((req, res, next) => {
  next(boom.notFound());
});

app.use((err, req, res, next) => {
  if (!err.isBoom) {
    if (err.name === 'ValidationError') {
      const error = boom.badData(Object.values(err.errors)[0].properties.message);
      return res.status(error.output.statusCode).json(error.output.payload);
    }
    logger.error(err.message);
    const error = boom.badImplementation();
    return res.status(error.output.statusCode).json(error.output.payload);
  }

  res.status(err.output.statusCode).json(err.output.payload);
});

module.exports = { app };
