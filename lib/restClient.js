
var request = require('request'),
    saToken = require('./saToken.js');

/**
 * Creates a new EventHub REST Client.
 *
 * @param {string} namespace    The ServiceBus Namespace to use.
 * @param {string} hubName      The EventHub name.
 * @param {string} saName       The Shared Access Policy name.
 * @param {string} saKey        The Shared Access Policy key.
\ */
var Client = function(namespace, hubName, saName, saKey) {
    this.token = saToken.create(namespace, hubName, saName, saKey);
    this.namespace = namespace;
    this.hubName = hubName;
    this.serviceBusUriSuffix = '?timeout=60&api-version=2014-01';
}

/**
 * Creates a new EventHub, with no creation options yet.  If it collides with an existing one, that's considered success.
 * WORK IN PROGRESS.
 *
 * @param {Function(err,statusCode)} callback    The callback - on success, no parameters will be provided (and thus error will evaluate to false).
 */
Client.prototype.createHubIfNotExists = function(callback) {
    var uri = 'https://' + this.namespace + '.servicebus.windows.net/' +
        this.hubName + serviceBusUriSuffix;
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
            'Authorization' : this.token
        },
        'body': body
    }, function (err, response, body) {
        if (!err && response.statusCode === 201) {
            callback();
        } else {
            if (response.statusCode === 409) {
                callback();
            } else {
                callback(err, response.statusCode);
            }
        }
    });
};

/**
 * Sends a message to the EventHub.
 * WORK IN PROGRESS.
 *
 * @param {String} body                         The body of the message to be sent.
 * @param {String} [publisher]                  The publisher to use.  By default, will publish to root of hub.
 * @param {Function(err,statusCode)} callback   The callback - on success, no parameters will be provided (and thus error will evaluate to false).
 */
Client.prototype.sendMessage = function(body, publisher, callback) {
    if (typeof publisher === 'function') {
        callback = publisher;
        publisher = null;
    }

    var uri = 'https://' + this.namespace + '.servicebus.windows.net/' +
        this.hubName + '/messages' + this.serviceBusUriSuffix;
    if (publisher) {
        uri = 'https://' + this.namespace + '.servicebus.windows.net/' +
            this.hubName + '/publishers/' + publisher + '/messages' + this.serviceBusUriSuffix;
    }

    request({
        'uri': uri,
        'method': 'POST',
        'headers': {
            'Content-Type' : 'application/atom+xml;type=entry;charset=utf-8',
            'Authorization' : this.token
        },
        'body': body
    }, function (err, response) {
        if (!err && response.statusCode === 201) {
            callback();
        } else {
            callback(err, response.statusCode);
        }
    });
};

module.exports.create = function(namespace, hubName, saName, saKey) {
    return new Client(namespace, hubName, saName, saKey); };
