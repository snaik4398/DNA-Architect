import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './routes/projectRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
    res.send('DNA Architect API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
