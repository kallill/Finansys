import dotenv from 'dotenv';
import path from 'path';

// Load env vars immediately
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/healthRoutes';
import walletRoutes from './routes/walletRoutes';
import reportsRoutes from './routes/reportsRoutes';
import webhookRoutes from './routes/webhookRoutes';
import pluggyRoutes from './routes/pluggyRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import creditCardRoutes from './routes/creditCardRoutes';
import crmAuthRoutes from './routes/crmAuthRoutes';
import crmDashboardRoutes from './routes/crmDashboardRoutes';
import crmPlanRoutes from './routes/crmPlanRoutes';

// dotenv config removed from here (moved to top)

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy for rate limiting behind Nginx
app.set('trust proxy', 1);

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
app.use('/webhook', webhookRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/pluggy', pluggyRoutes);
app.use('/credit-cards', creditCardRoutes);

// CRM Admin Routes
app.use('/api/crm/auth', crmAuthRoutes);
app.use('/api/crm/dashboard', crmDashboardRoutes);
app.use('/api/crm/plans', crmPlanRoutes);

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
      await sequelize.sync({ alter: true }); 
      console.log('All models were synchronized successfully.');
    } catch (syncError: any) {
      console.error('CRITICAL: Schema sync error. Verify migrations or database constraints:', {
        message: syncError.message,
        name: syncError.name,
        stack: syncError.stack,
        original: syncError.original
      });
      // We don't exit(1) here yet to allow the health check to work
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Fail hard so PM2 restarts
  }
};

startServer();
