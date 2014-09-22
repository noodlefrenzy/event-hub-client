//
// Copyright (c) Microsoft and contributors.  All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

var crypto = require('crypto');
var utf8 = require('utf8');

/**
 * Creates a new Shared Access Token for use in the Authorization header of ServiceBus/EventHub calls.
 *
 * @param {string} namespace    The ServiceBus Namespace to use.
 * @param {string} hubName      The EventHub name.
 * @param {string} saName       The Shared Access Policy name.
 * @param {string} saKey        The Shared Access Policy key.
 * @return {string}             A Shared Access token string.
 *
 */
function createSharedAccessToken(namespace, hubName, saName, saKey) {
    if (!namespace || !hubName || !saName || !saKey) {
        throw "Missing required parameter";
    }

    var uri = 'https://' + namespace +
        '.servicebus.windows.net/' + hubName + '/';

    var encoded = encodeURIComponent(uri);
    
    var epoch = new Date(1970, 1, 1, 0, 0, 0, 0);
    var now = new Date();
    var year = 365 * 24 * 60 * 60;
    var ttl = ((now.getTime() - epoch.getTime()) / 1000) + (year * 5);

    var signature = encoded + '\n' + ttl;
    var signatureUTF8 = utf8.encode(signature);
    var hash = crypto.createHmac('sha256', saKey).update(signatureUTF8).digest('base64');

    return 'SharedAccessSignature sr=' + encoded + '&sig=' + 
        encodeURIComponent(hash) + '&se=' + ttl + '&skn=' + saName;
}

module.exports.create = createSharedAccessToken;
