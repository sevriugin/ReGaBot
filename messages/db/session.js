'use strict';

const mongoose = require('mongoose')
	, Schema = mongoose.Schema;

var sessionSchema = new Schema({
	id: String,
	channelId: String,
	user: {
		id: String,
		name: String
	},
	conversation: {
		id: String
	},
	bot: {
		id: String
	},
	serviceUrl: String,
	useAuth:false
});

/**
 * Static method for find session address by id
 * @returns {function} - the Error if session wasn't found or another error occured. Otherwise return session address document or fields of projection
 */
sessionSchema.statics.findById = function (id, fields, cb) {
	if (id == null || id == undefined) throw new SyntaxError('Not specified session address id');
	else if (typeof fields === 'function') {
		cb = fields;
		fields = '';
	}

	return this.findOne({ id: id }, fields, function (err, session) {
		if (err) cb(err);
		else if (!session) cb(new Error('Sessions is not found!'));
		else cb(null, session);
	});
};


/**
 * Static method for adding session
 */
sessionSchema.statics.add = function (sessionAddress, cb) {
	let Sessions = mongoose.model('Sessions');
	let user = {
		id: sessionAddress.user.id,
		name: sessionAddress.user.name
	};
	let conversation = {
		id: sessionAddress.conversation.id
	};
	let bot = {
		id: sessionAddress.bot.id
	};
	let session = new Sessions({
		id: sessionAddress.id,
		channelId: sessionAddress.channelId,
		user: user,
		conversation: conversation,
		bot: bot,
		serviceUrl: sessionAddress.serviceUrl,
		useAuth: sessionAddress.useAuth
	});

	session.save(function (err, session) {
		if (err) {
			console.error(err);
			return cb(err);
		}
		console.log(`Added session '${session.id}'`);
		return cb(null, session);
	});
};

mongoose.model('Sessions', sessionSchema);
