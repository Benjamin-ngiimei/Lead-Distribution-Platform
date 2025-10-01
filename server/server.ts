import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';
import assignmentRoutes from './routes/assignments';
import agentRoutes from './routes/agents'; // Import agent routes

dotenv.config({ path: 'server/.env' });

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/agents', agentRoutes); // Use agent routes

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
