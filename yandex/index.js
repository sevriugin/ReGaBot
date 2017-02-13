/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
// "use strict";

// This loads the environment variables from the .env file

const   db = require('../messages/db'), 
        Users = require('mongoose').model('Users'),
        Sessions = require('mongoose').model('Sessions'),
        yandexMoney = require('..messages/yandexMoney'),
        config  = require('../messages/config'),
        bodyParser  = require('body-parser');

//create application/json parser 
var jsonParser          = bodyParser.json()
 
// create application/x-www-form-urlencoded parser 
var urlencodedParser    = bodyParser.urlencoded({ extended: true })

/**
 * YaMoney auth GET middleware
 */
function getAccessToken(req, res, next) {
    if (!req.query.code) return next(new Error(`code expected`));
    var code = req.query.code;
    var tokenComplete = function (err, data) {
        if (err) return next(new TokenError(`Error: did not get the token: ${err}`));

        console.info(`tokenComplete data: ` + JSON.stringify(data));
        
        var sessionId   = req.query.sessionId;  
        var accessToken = data.access_token;
        
        // If token has not been received
        if (accessToken === undefined) return next(new TokenError(`Acess token is undefined.`));
        else if (sessionId === undefined) return next(new Error(`Session is not defined.`));

        // restore session
        Sessions.findById(sessionId, function(err, address) {
            
            if (err) return next(err);
            
            var userId = address.user.id;
            // Save user access token to DB
            Users.setUserToken(userId, accessToken, function(err) {
                if (err) return next(new Error(`Try another time.`));
                console.info(`Added token for ${userId}`);
            });
        
            // Send success status
            res.send('Get token, sending message to bot...');
        
            // let msg = new builder.Message()
            //  .address(address)
            //  .text("Great! U R Autorized...");
            // bot.send(msg);
            
            // console.info(`tokenComplete address: ` + JSON.stringify(address));
            // bot.beginDialog({id:address.id, user:address.user, bot:address.bot, channelId:address.channelId, conversation:address.conversation, serviceUrl:address.serviceUrl},'/yabalance');
        });
    };
    yandexMoney.getAccessToken(config.yandexAPI.clientId, code, config.yandexAPI.redirectURI, config.yandexAPI.clientSecret, tokenComplete);
}


module.exports = { default: getAccessToken }
