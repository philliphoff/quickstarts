# ------------------------------------------------------------
# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
# ------------------------------------------------------------

import flask
from flask import request, jsonify
from flask_cors import CORS
import json
import logging
import os
import seqlog
import sys

seqProtocol = os.environ.get("SEQ_SERVICE_PROTOCOL", "http")
seqHost = os.environ.get("SEQ_SERVICE_HOST", "localhost")
seqPort = os.environ.get("SEQ_SERVICE_PORT", "5341")
seqUrl = "{}://{}:{}".format(seqProtocol, seqHost, seqPort)

seqlog.set_global_log_properties(
    name="python-subscriber"
)

seqlog.log_to_seq(
   server_url=seqUrl,
   level=logging.INFO,
   batch_size=10,
   auto_flush_timeout=10,  # seconds
   override_root_logger=True
)

port = int(os.environ.get("PORT", 5000))

app = flask.Flask(__name__)
CORS(app)

@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{'pubsubname': 'pubsub', 'topic': 'A', 'route': 'A'}, {'pubsubname': 'pubsub', 'topic': 'C', 'route': 'C'}]
    return jsonify(subscriptions)

@app.route('/A', methods=['POST'])
def a_subscriber():
    logging.info("{event}: {message}", event=request.json['topic'], message=request.json['data']['message'])
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

@app.route('/C', methods=['POST'])
def c_subscriber():
    logging.info("{event}: {message}", event=request.json['topic'], message=request.json['data']['message'])
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

app.run(host='0.0.0.0', port=port)
