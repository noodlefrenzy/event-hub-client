var crypto = require('crypto');
var utf8 = require('utf8');

var namespace = 'hub-ns',
    hubName = 'hub',
    sasName = '[SAS-Name]',
    sasKey = '[SAS-Key]',
    sbUriSuffix = '?timeout=60&api-version=2014-01';

function createSasToken(options) {
    var uri = 'https://' + options.namespace +
        '.servicebus.windows.net/' + options.hubName + '/';

    var encoded = encodeURIComponent(uri);
    
    var epoch = new Date(1970, 1, 1, 0, 0, 0, 0);
    var now = new Date();
    var year = 365 * 24 * 60 * 60;
    var ttl = ((now.getTime() - epoch.getTime()) / 1000) + (year * 5);

    var signature = encoded + '\n' + ttl;
    var signatureUTF8 = utf8.encode(signature);
    var hash = crypto.createHmac('sha256', options.sasKey).update(signatureUTF8).digest('base64');

    return 'SharedAccessSignature sr=' + encoded + '&sig=' + 
        encodeURIComponent(hash) + '&se=' + ttl + '&skn=' + options.sasName; 
}

var request = require('request');

function createAHub(options) {
    var token = createSasToken(options);
    var uri = 'https://' + options.namespace + '.servicebus.windows.net/' +
        options.hubName + sbUriSuffix;
    var body = '' + 
'<entry xmlns="http://www.w3.org/2005/Atom">'+
'  <content type="application/xml">'+
'    <EventHubDescription xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/netservices/2010/10/servicebus/connect">'+
'    </EventHubDescription>'+
'  </content>'+
'</entry>';
    request({ 
        'uri': uri, 
        'method': 'PUT',
        'headers': {
            'Content-Type' : 'application/atom+xml;type=entry;charset=utf-8',
            'Authorization' : token
        },
        'body': body
    }, function (error, response, body) {
        if (!error && response.statusCode === 201) {
            console.log('Successfully created hub ' + options.hubName);
        } else {
            console.log('Failed to create hub '+options.hubName+': '+error+', Status: '+response.statusCode+', Body: '+body);
        }
    });
}

function postAMessage(options) {
    var token = createSasToken(options);
    var uri = 'https://' + options.namespace + '.servicebus.windows.net/' +
        options.hubName + '/messages' + sbUriSuffix;
    var body = '{ "DeviceId": "laptop", "Message": "Paging Dr. Feelgood" }';
    request({
        'uri': uri,
        'method': 'POST',
        'headers': {
            'Content-Type' : 'application/atom+xml;type=entry;charset=utf-8',
            'Authorization' : token
        },
        'body': body
    }, function (error, response, body) {
        if (!error && response.statusCode === 201) {
            console.log('Successfully posted message to hub ' + options.hubName);
        } else {
            console.log('Failed to post message to hub '+options.hubName+': '+error+', Status: '+response.statusCode+', Body: '+body);
        }
    });
}

//postAMessage({ 'namespace': namespace, 'hubName': hubName, 'sasName': sasName, 'sasKey': sasKey });

var amqp = require('amqplib');

function postWithAmqp(options) {
    var token = createSasToken(options);
    var amqpUri = 'amqp://'+options.namespace+'.servicebus.windows.net/;'+token+';TransportType=Amqp';
    amqp.connect(amqpUri, function (err, conn) {
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

postWithAmqp({ 'namespace': namespace, 'hubName': hubName, 'sasName': sasName, 'sasKey': sasKey });
