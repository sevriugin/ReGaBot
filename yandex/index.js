"use strict";

var config  = require('../messages/config');
var azure   = require('azure-storage');
var queueService = azure.createQueueService(config.azure_storage.account, config.azure_storage.key1);

queueService.createQueueIfNotExists('myqueue', function(error) {
    if (!error) {
        // Queue exists
        console.info(`createQueueIfNotExists: Queue is created` + config.azure_storage.name);
    }
});

module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    if (req.query.code || (req.body && req.body.code)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            // body: "code=" + (req.query.code || req.body.code) + " sessionId=" + req.query.sessionId
            // status: 301,
            // header: "Location: http://www.example.org/"
            body: "Please return to the chat..."
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }

    queueService.createMessage('myqueue', req.query.sessionId + (req.query.code || req.body.code) , function(error) {
        if (!error) {
            // Message inserted
            console.info(`createMessage: Message is inserted`);
        }
    });

    context.done();
};
