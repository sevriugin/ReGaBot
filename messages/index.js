/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
// "use strict";

// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var blockchain = require("./blockchain");

const   captionService = require('./caption-service'),
        needle = require("needle"),
        url = require('url'),
        validUrl = require('valid-url');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

//Sends greeting message when the bot is first added to a conversation
bot.on('conversationUpdate', message => {
    if (message.membersAdded) {
        message.membersAdded.forEach(identity => {
            if (identity.id === message.address.bot.id) {
                const reply = new builder.Message()
                    .address(message.address)
                    .text("Ciao! I am ReGa Bot. Type something to start...");
                bot.send(reply);
            }
        });
    }
});

bot.beginDialogAction('beginImageDialog', '/image');
bot.beginDialogAction('beginEthereumDialog', '/accounts');

bot.dialog('/', [
    function (session, args) {

        var card = createCard(HeroCardName, session);

        // attach the card to the reply message
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
    }
]);

bot.dialog('/accounts',[
    function (session, args, next) {
        blockchain.createAccounts(function(addr) {
            session.userData.accounts   = addr
            
            if(addr) {
                if(Array.isArray(addr)) {
                    if(addr.length > 0) {
                        builder.Prompts.choice(session, "Your have " + addr.length + " accounts. Select one to check?", session.userData.accounts);
                    }
                }
            }
            else {
                session.send("It looks like you don't have any Ethereum accounts");
                session.beginDialog('/end');
            }
        });
    },
    function (session, results) {
        session.userData.selection = results.response.entity;
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
    function(session, args, next) {

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
                            session.send("Account balance: " + balance / 1.0e18 + " Ξ");  
                        
                            session.beginDialog('/');
                        });
                    }
                }
            }
        });
    }
]);

bot.dialog('/image', session => {
    if (hasImageAttachment(session)) {
        var stream = getImageStreamFromUrl(session.message.attachments[0]);
        captionService
            .getCaptionFromStream(stream)
            .then(caption => handleSuccessResponse(session, caption))
            .catch(error => handleErrorResponse(session, error));
    }
    else if(imageUrl = (parseAnchorTag(session.message.text) || (validUrl.isUri(session.message.text)? session.message.text : null))) {
        captionService
            .getCaptionFromUrl(imageUrl)
            .then(caption => handleSuccessResponse(session, caption))
            .catch(error => handleErrorResponse(session, error));
    }
    else {
        session.send("Did you upload an image? I'm more of a visual person. Try sending me an image or an image URL");
    }
});

const HeroCardName = 'Hero card';
const ThumbnailCardName = 'Thumbnail card';
const ReceiptCardName = 'Receipt card';
const SigninCardName = 'Sign-in card';
const CardNames = [HeroCardName, ThumbnailCardName, ReceiptCardName, SigninCardName];

function createCard(selectedCardName, session) {
    switch (selectedCardName) {
        case HeroCardName:
            return createHeroCard(session);
        case ThumbnailCardName:
            return createThumbnailCard(session);
        case ReceiptCardName:
            return createReceiptCard(session);
        case SigninCardName:
            return createSigninCard(session);
        default:
            return createHeroCard(session);
    }
}

function createHeroCard(session) {
    var address = JSON.stringify(session.message.address);
    return new builder.HeroCard(session)
        .title('ReGa Risk Sharing')
        .subtitle('ReGa Bot — wherever ReGa members are talking')
        .text('I can check your Ethereum account balance and you can try sending me an image or an image URL and I will describe it. address = ' + address)
        .images(getSampleCardImages(session))
        .buttons(getImageDialogActions(session));
}

function createThumbnailCard(session) {
    var address = JSON.stringify(session.message.address);
    return new builder.ThumbnailCard(session)
        .title('ReGa Risk Sharing')
        .subtitle('ReGa Bot — wherever ReGa members are talking')
        .text('I can check your Ethereum account balance and you can try sending me an image or an image URL and I will describe it. address = ' + address)
        .images(getSampleCardImages(session))
        .buttons(getImageDialogActions(session));
}

var order = 1234;
function createReceiptCard(session) {
    return new builder.ReceiptCard(session)
        .title('John Doe')
        .facts([
            builder.Fact.create(session, order++, 'Order Number'),
            builder.Fact.create(session, 'VISA 5555-****', 'Payment Method'),
        ])
        .items([
            builder.ReceiptItem.create(session, '$ 38.45', 'Data Transfer')
                .quantity(368)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png')),
            builder.ReceiptItem.create(session, '$ 45.00', 'App Service')
                .quantity(720)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'))
        ])
        .tax('$ 7.50')
        .total('$ 90.95')
        .buttons([
            builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/pricing/', 'More Information')
                .image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
        ]);
}

function createSigninCard(session) {
    return new builder.SigninCard(session)
        .text('BotFramework Sign-in Card')
        .button('Sign-in', 'https://login.microsoftonline.com')
}

function getSampleCardImages(session) {
    return [
        builder.CardImage.create(session, 'https://raw.githubusercontent.com/sevriugin/ReGaBot/master/messages/regabot.png')
    ];
}

function getSampleCardActions(session) {
    return [
        builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Get Started')
    ];
}

function getImageDialogActions(session) {
    return [
        builder.CardAction.dialogAction(session, 'beginImageDialog', null, 'Images'),
        builder.CardAction.dialogAction(session, 'beginEthereumDialog', null, 'Ethereum'),
    ];
}

//=========================================================
// Utilities
//=========================================================
const hasImageAttachment = session => {
    return ((session.message.attachments.length > 0) && (session.message.attachments[0].contentType.indexOf("image") !== -1));
}

const getImageStreamFromUrl = attachment => {
    var headers = {};
    if (isSkypeAttachment(attachment)) {
        // The Skype attachment URLs are secured by JwtToken,
        // you should set the JwtToken of your bot as the authorization header for the GET request your bot initiates to fetch the image.
        // https://github.com/Microsoft/BotBuilder/issues/662
        connector.getAccessToken((error, token) => {
            var tok = token;
            headers['Authorization'] = 'Bearer ' + token;
            headers['Content-Type'] = 'application/octet-stream';

            return needle.get(attachment.contentUrl, { headers: headers });
        });
    }

    headers['Content-Type'] = attachment.contentType;
    return needle.get(attachment.contentUrl, { headers: headers });
}

const isSkypeAttachment = attachment => {
    if (url.parse(attachment.contentUrl).hostname.substr(-"skype.com".length) == "skype.com") {
        return true;
    }

    return false;
}

/**
 * Gets the href value in an anchor element.
 * Skype transforms raw urls to html. Here we extract the href value from the url
 */
const parseAnchorTag = input => {
    var match = input.match("^<a href=\"([^\"]*)\">[^<]*</a>$");
    if(match && match[1]) {
        return match[1];
    }

    return null;
}

//=========================================================
// Response Handling
//=========================================================
const handleSuccessResponse = (session, caption) => {
    if (caption) {
        session.send("I think it's " + caption);
    }
    else {
        session.send("Couldn't find a caption for this one");
    }
    session.beginDialog('/');
}

const handleErrorResponse = (session, error) => {
    session.send("Oops! Something went wrong. Try again later. error."  
        + "message: "       + error.message 
        + " .description: " + error.description 
        + " .number: "      + error.number 
        + " .name: "        + error.name
        + " .toString(): "  + error.toString());
    session.send("Access token : " + process.env.MICROSOFT_VISION_API_KEY);
    console.error(error);
}


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