import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  res.redirect('/index.html');
});

app.use('/async_request_queue', express.static('async_request_queue/public'));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})
