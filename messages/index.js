/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var blockchain = require("./blockchain");

var useEmulator = (process.env.NODE_ENV == 'development');

// var useEmulator = true;

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, "Ciao... What's your name?");
    },
    function (session, results) {
        blockchain.createAccounts(function(addr) {
            session.userData.name       = results.response;
            session.userData.accounts   = addr
            
            if(addr) {
                if(Array.isArray(addr)) {
                    if(addr.length > 0) {
                        session.send("Hi " + results.response + ", you have " + addr.length  + " Ethereum account(s)");
                        session.beginDialog('/accounts');
                    }
                }
            }
            else {
                session.send("Hi " + results.response + ", it looks like you don't have any Ethereum accounts");
                session.beginDialog('/end');
            }
        });
    }
]);

bot.dialog('/accounts',[
    function(session) {
        builder.Prompts.choice(session, "What account are you going to use?", session.userData.accounts);
    },
    function (session, results) {
        session.userData.selection = results.response.entity;
        session.send("Ok, balance for account [" + session.userData.selection + "] ...");
        session.beginDialog('/balance');
    }
]);

bot.dialog('/end',[
    function(session) {
        session.send("Ciao " + session.userData.name + " !");
        session.beginDialog('/');
    }
]);

bot.dialog('/error',[
    function(session) {
        session.send("Ops, " + session.userData.name + " I've got a problem here");
        session.beginDialog('/');
    }
]);

bot.dialog('/balance',[
    function(session) {

        console.log('get balance called');
        session.sendTyping();
    
        blockchain.createAccounts(function(addr) {

            console.log('blockchain.createAccounts called.');
        
            if(addr) {
                if(Array.isArray(addr)) {
                    if(addr.length > 0) {
                        console.log('blockchain.getBalance is about to call for account: ' + session.userData.selection);
                        blockchain.getBalance(session.userData.selection, function(balance){
                            console.log('blockchain.getBalance result: ' + balance);
                            session.send("Account balance for " + session.userData.selection + " is " + balance);
                            session.beginDialog('/end');
                        });
                    }
                }
            }
        });
    }
]);


if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}