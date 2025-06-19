import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Default route for health check or deployment verification
app.get('/', (req, res) => {
  res.send('Server running Successfully');
});

// Use authentication routes
app.use('/api/auth', authRoutes);

// Remove app.listen for Vercel compatibility
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running Successfully on port ${PORT}`);
// });

export default app;