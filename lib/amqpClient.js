var amqplib = require('amqplib');

function postWithAmqplib(namespace, hubName, saName, saKey) {
    var user = saName,
        pass = encodeURIComponent(saKey),
        amqpUri = 'amqps://'+user+':'+pass+'@'+
            namespace+'.servicebus.windows.net';

    console.log('Trying to connect to '+amqpUri);
    amqplib.connect(amqpUri, function (err, conn) {
        if (err) {
            console.warn('Failed to connect: '+err+' to '+amqpUri);
        } else {
            conn.createChannel(function (err, ch) {
                if (err) {
                    console.warn('Failed to create channel: '+err);
                } else {
                    ch.assertQueue(options.hubName);
                    ch.sendToQueue(options.hubName, new Buffer('Howdy'));
                }
            });
        }
    });
}

var amqp = require('amqp');

function postWithAmqp(namespace, hubName, saName, saKey) {
    var user = saName,
        pass = encodeURIComponent(saKey),
        amqpUri = 'amqps://'+user+':'+pass+'@'+
            namespace+'.servicebus.windows.net/';

    console.log('Trying to connect to '+amqpUri);
    var conn = amqp.createConnection(amqpUri);
    conn.on('ready', function() {
        console.log('Connected');
        connection.exchange(hubName, { confirm: true }, function(e) {
            console.log('Exchange created');
            e.publish('', new Buffer('Howdy'), function (err) {
                if (err) {
                    console.warn('Failed to send.');
                } else {
                    console.log('Sent');
                }
            });
        });
    });
}

//postWithAmqplib(namespace, hubName, sasName, sasKey);
