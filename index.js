// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config');  // Import DB connection
const Main = require('./routes/routes');  // Import routes
const path = require("path");

// const session = require('express-session');

dotenv.config(); // Load environment variables

const app = express();

// Middleware to parse JSON requests
app.use(express.json());  // To parse JSON request bodies
app.use(express.urlencoded({ extended: true }));  // To parse URL encoded bodies

// Enable CORS (for requests from the frontend)
app.use(cors({
  origin: 'https://hapests.com',
  credentials: true,
}));

// Use routes
app.use('/api', Main);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware setup
// app.use(
//   session({
//     secret: 'HMU',  // Secret key for session signing
//     resave: false,  // Don't resave sessions if not modified
//     saveUninitialized: true,  // Save session even if not initialized
//     cookie: {
//       httpOnly: true,  // Helps prevent XSS attacks
//       secure: false,  // Set to true if using HTTPS
//       maxAge: 36000000  // Session expires after 1 hour (adjust as needed)
//     }
//   })
// );

// Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
// Log all incoming requests
app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url}`);
  next();
});

// Catch all unhandled errors in routes
app.use((err, req, res, next) => {
  console.error('🔥 UNHANDLED ERROR:', err);
  res.status(500).json({ msg: 'Server error', error: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
