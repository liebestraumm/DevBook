import express from 'express';

import connectDB from './config/db.js';
import usersRoute from './routes/api/users.js';
import authRoute from './routes/api/auth.js';
import postsRoute from './routes/api/posts.js';
import profileRoute from './routes/api/profile.js';

const app = express();

//Connect Database
connectDB();

//Initialize Middleware
app.use(express.json({
    extended: false
}));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
     res.send("API!");
});

//Define Routes
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);
app.use('/api/posts', postsRoute);

app.listen(PORT, () => {
    console.log(`Server works in ${PORT}`);
})
