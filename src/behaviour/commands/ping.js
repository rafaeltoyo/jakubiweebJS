module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(bot, msg) {
		msg.channel.send('Pong.');
	},
};
