const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Initialize database
require('./config/database');

const app = express();

// Handle OPTIONS requests FIRST - before anything else
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }
  next();
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers (onclick)
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS - restrict in production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : null)
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow localhost origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production: if ALLOWED_ORIGINS is not set, allow all origins
    // Otherwise, only allow origins in the ALLOWED_ORIGINS list
    if (allowedOrigins === null || allowedOrigins.length === 0) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (more lenient for normal use)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per 15 minutes
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API Routes - MUST come before static file serving
const authRoutes = require('./routes/auth');
const bankingRoutes = require('./routes/banking');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/admin', adminRoutes);

console.log('API Routes registered:');
console.log('  POST /api/auth/signup');
console.log('  POST /api/auth/login');
console.log('  GET  /api/auth/me');
console.log('  GET  /api/banking/balance');
console.log('  GET  /api/banking/transactions');
console.log('  POST /api/banking/transfer');
console.log('  GET  /api/admin/users');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Serve static files (frontend) - works in both dev and production
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Catch-all handler: serve index.html for any non-API GET routes (for SPA routing)
app.get('*', (req, res, next) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Serve index.html for all other routes (SPA fallback)
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Port configuration: Use PORT env var if set (deployment), otherwise find random free port (local dev)
const net = require('net');

// Function to check if a port is available (more reliable method)
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(true))
          .close();
      })
      .listen(port);
  });
}

// Function to find a random free port
async function findRandomFreePort(minPort = 5000, maxPort = 10000, maxAttempts = 200) {
  console.log('🔍 Searching for a random free port...');
  const portRange = maxPort - minPort;
  const triedPorts = new Set();
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate a random port in the range
    let randomPort;
    do {
      randomPort = Math.floor(Math.random() * portRange) + minPort;
    } while (triedPorts.has(randomPort) && triedPorts.size < portRange);
    
    triedPorts.add(randomPort);
    
    // Check if this port is available
    const available = await isPortAvailable(randomPort);
    
    if (available) {
      return randomPort;
    }
  }
  
  // If random attempts failed, fall back to sequential search
  console.log('⚠️  Random port search exhausted, trying sequential search...');
  for (let port = minPort; port <= maxPort; port++) {
    if (!triedPorts.has(port)) {
      const available = await isPortAvailable(port);
      if (available) {
        return port;
      }
    }
  }
  
  throw new Error('No free port found in range 5000-10000');
}

// Determine which port to use
async function getPort() {
  // If PORT is explicitly set (deployment), use it
  if (process.env.PORT) {
    return parseInt(process.env.PORT);
  }
  
  // Otherwise, find a random free port (local development)
  // Start from 6000 to avoid common ports like 5000, 3000, etc.
  // Use range 6000-9999 for better randomness
  const freePort = await findRandomFreePort(6000, 9999);
  console.log(`🎲 Random free port selected: ${freePort}`);
  return freePort;
}

// Validate environment variables
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret')) {
  console.warn('⚠️  WARNING: Using default JWT_SECRET in production is insecure!');
  console.warn('⚠️  Please set JWT_SECRET environment variable');
}

// Start server
async function startServer() {
  const PORT = await getPort();
  
  // Add endpoint to get server port (for frontend)
  app.get('/api/server-info', (req, res) => {
    res.json({ port: PORT });
  });
  
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ Production mode enabled');
    } else {
      console.log('🔧 Development mode - using dynamic port');
    }
    console.log(`\n🌐 Access your app at: http://localhost:${PORT}\n`);
  });

  // Handle port already in use error (shouldn't happen since we check before listening)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ ERROR: Port ${PORT} became unavailable after check!\n`);
      console.log('This should not happen. Trying to find another port...\n');
      // Try to restart with a new port
      setTimeout(async () => {
        try {
          const newPort = await findRandomFreePort(5000, 10000);
          console.log(`🔄 Retrying with port: ${newPort}`);
          server.close();
          const newServer = app.listen(newPort, () => {
            console.log(`✅ Server running on port ${newPort}`);
            console.log(`🌐 Access your app at: http://localhost:${newPort}\n`);
          });
          serverInstance = newServer;
        } catch (retryError) {
          console.error('Failed to find alternative port:', retryError);
          process.exit(1);
        }
      }, 1000);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
  
  return server;
}

// Start server and handle graceful shutdown
let serverInstance = null;

startServer().then(server => {
  serverInstance = server;
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});