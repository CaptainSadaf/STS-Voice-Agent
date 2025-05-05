require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { twiml: { VoiceResponse } } = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/voice', (req, res) => {
  const response = new VoiceResponse();
  response.connect().stream({
    url: `wss://${process.env.HOST}:${process.env.PORT}/stream`
  });
  res.type('text/xml').send(response.toString());
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
