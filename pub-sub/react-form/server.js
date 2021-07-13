// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const path = require('path');
const request = require('request');
const bodyParser = require('body-parser');
const bunyan = require('bunyan');
const seq = require('bunyan-seq');

const seqProtocol = process.env.SEQ_SERVICE_PROTOCOL || 'http';
const seqHost = process.env.SEQ_SERVICE_HOST || 'localhost';
const seqPort = process.env.SEQ_SERVICE_PORT || '5341';
const seqUrl = `${seqProtocol}://${seqHost}:${seqPort}`;

const log = bunyan.createLogger({
    name: 'react-form',
    streams: [
      {
        stream: process.stdout,
        level: 'info'
      },
      seq.createStream({
        serverUrl: seqUrl,        
        level: 'info',
        onError: () => { /* Ignore errors. */ }
      })
    ]
  });

const app = express();
app.use(bodyParser.json());

const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const daprUrl = `http://localhost:${daprPort}/v1.0`;
const port = parseInt(process.env.PORT || '8080', 10);
const pubsubName = 'pubsub';

app.post('/publish', (req, res) => {
  log.info({ body: req.body }, "Publishing: {body}");
  const publishUrl = `${daprUrl}/publish/${pubsubName}/${req.body.messageType}`;
  request( { uri: publishUrl, method: 'POST', json: req.body } );
  res.sendStatus(200);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));

// For all other requests, route to React client
app.get('*', function (_req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}!`));