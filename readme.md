event-hub-client
========

Simple Azure EventHub Client.  Uses REST API for Create/Send operations, trying to use AMQP once I can get it working.

## Usage

    function demonstrateEventHubSend() {
        var client = require('event-hub-client').restClient(
            serviceBusNamespace,
            eventHubName,
            sharedAccessKeyName,
            sharedAccessKey);
        client.sendMessage('{ "device": "laptop", "message": "My message body." }');
    }

## Caveats

* So far, can't get AMQP up and running.  I've tried the ```amqp``` and ```amqplib``` modules.

## Installation

Currently not a registered *npm* module, so add it to your package.json as a GitHub-based dependency:

```
    "dependencies": {
        "event-hub-client": "noodlefrenzy/event-hub-client"
      },
```

Then you can just run ```npm install``` to install it.

## License

Apache v2, see LICENSE