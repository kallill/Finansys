import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './config/database';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/healthRoutes';
import walletRoutes from './routes/walletRoutes';
import reportsRoutes from './routes/reportsRoutes';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/auth', limiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/user', userRoutes);
app.use('/health', healthRoutes);
app.use('/wallet', walletRoutes);
app.use('/reports', reportsRoutes);

// Serve static files from the React frontend app
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Anything that doesn't match the above, send back index.html
// Note: Using (.*) for catch-all in Express 5
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Database Connection and Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models with database
    try {
      await sequelize.sync(); 
      console.log('All models were synchronized successfully.');
    } catch (syncError) {
      console.error('Schema sync error (server will still start):', syncError);
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Start server anyway to avoid Connection Refused on frontend
    app.listen(port, () => {
      console.log(`Server started on port ${port} (Offline Mode - DB Failed)`);
    });
  }
};

startServer();
