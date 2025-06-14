require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const authMiddleware = require('./middlewares/auth');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost'; 
const path = require('path');
const http = require('http');
const server = http.createServer(app);



app.use(helmet());
app.use(cors());
app.use(morgan('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 

// Trust proxy headers
app.set('trust proxy', true);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  // const message = 'hi';
  // const socketManager = req.app.get('socketManager');
  
  // const sent = socketManager.sendToUser(20, 'notification', {
  //   type: 'alert', 
  //   message,
  //   timestamp: new Date()
  // });
});



app.use('/auth', require('./routes/public/authRoutes'));

app.use(authMiddleware());

app.use('/users', require('./routes/private/userRoutes'));
app.use('/admin', require('./routes/private/adminRoutes'));


app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing token'
    });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something broke!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found' 
  });
});

// Replace app.listen with server.listen
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
}); 
