// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
const bunyan = require('bunyan');
const seq = require('bunyan-seq');

const seqProtocol = process.env.SEQ_SERVICE_PROTOCOL || 'http';
const seqHost = process.env.SEQ_SERVICE_HOST || 'localhost';
const seqPort = process.env.SEQ_SERVICE_PORT || '5341';
const seqUrl = `${seqProtocol}://${seqHost}:${seqPort}`;

const log = bunyan.createLogger({
    name: 'node-subscriber',
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
// Dapr publishes messages with the application/cloudevents+json content-type
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = parseInt(process.env.PORT || '3000', 10);

app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "A",
            route: "A"
        },
        {
            pubsubname: "pubsub",
            topic: "B",
            route: "B"
        }
    ]);
});

app.post('/A', (req, res) => {
    log.info({ event: "A", message: req.body.data.message }, '{event}: {message}');
    res.sendStatus(200);
});

app.post('/B', (req, res) => {
    log.info({ event: "B", message: req.body.data.message }, '{event}: {message}');
    res.sendStatus(200);
});

app.listen(port, () => {
    log.info({ port }, 'Node App listening on port {port}!');
});
