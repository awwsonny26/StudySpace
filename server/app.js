const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const categoryRoutes = require('./routes/category.routes');
const courseRoutes = require('./routes/course.routes');
const rawQueryRoutes = require('./routes/raw-query.routes');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const userRoutes = require('./routes/user.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'StudySpace API is working.' });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/mysql-demo', rawQueryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
