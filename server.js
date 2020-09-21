const express = require('express');
const morgan  = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config({ path: './config/config.env' });

app.use(express.json());

//if in developer mode allow client to connect with server
if(process.env.NODE_ENV === 'development'){
    app.use(cors({ origin: process.env.CLIENT_URL }))
    app.use(morgan('dev'))
}

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log("MongoDB Connected..."))
    .catch(() => console.log("MongoDB Error"));

//Routes
app.use('/api', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));