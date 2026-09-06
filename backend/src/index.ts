import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { initDb } from './database/db';
import { initializeDatabase } from './database/schema';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import farmerRoutes from './routes/farmer';
import consumerRoutes from './routes/consumer';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import coordinatorRoutes from './routes/coordinator';
import notificationRoutes from './routes/notifications';
import profileRoutes from './routes/profile';

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman) or any onrender.com / localhost
    if (!origin || origin === process.env.FRONTEND_URL || origin.endsWith('.onrender.com') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coordinator', coordinatorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (req, res) => { res.json({ status: 'ok', message: 'FarmDirect Hub API is running' }); });

// Initialize DB (async) then start server
async function startServer() {
  await initDb();
  initializeDatabase();
  app.listen(PORT, () => {
    console.log(`🌱 FarmDirect Hub Backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
