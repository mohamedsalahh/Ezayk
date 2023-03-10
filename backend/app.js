const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const boom = require('@hapi/boom');

const { connectToMongoDB } = require('./config/mongodb');
const { connectToSocketIo, initSocketIoConnection } = require('./config/socket.io');
const { env } = require('./config/constants');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const groupRoutes = require('./routes/group.route');
const { rootDir } = require('./utils/files-paths');
const authMiddleware = require('./middlewares/auth.middleware');
const asyncErrorHandler = require('./middlewares/asyncErrorHandler.middleware');
const userMiddleware = require('./middlewares/user.middleware');

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.static(path.join(rootDir, 'public')));

app.use('/auth', authRoutes);
app.use(
  '/users',
  asyncErrorHandler(authMiddleware.verifyAccessToken),
  asyncErrorHandler(userMiddleware.getUser),
  userRoutes
);
app.use(
  '/groups',
  asyncErrorHandler(authMiddleware.verifyAccessToken),
  asyncErrorHandler(userMiddleware.getUser),
  groupRoutes
);

app.use((req, res, next) => {
  next(boom.notFound());
});

app.use((err, req, res, next) => {
  console.log(err);
  if (!err.output?.payload || !err.output?.statusCode) {
    const error = boom.badImplementation();

    return res.status(error.output.statusCode).json({ data: error.output.payload });
  }

  if (err.data) {
    err.output.payload.data = err.data;
  }

  res.status(err.output.statusCode).json({ data: err.output.payload });
});

const initApp = async () => {
  try {
    await connectToMongoDB();

    const server = app.listen(env.PORT);

    await connectToSocketIo(server);
    initSocketIoConnection();
  } catch (err) {
    console.log(err);
  }
};

initApp();
