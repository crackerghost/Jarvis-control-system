const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require('cors');
dotenv.config();
app.use(express.json());
app.use(cors());
app.use('/v1/api',require('./routes/main'))
app.listen(process.env.PORT, async () => {
  console.log(`running in port ${process.env.PORT}`);
});
