// Require the necessary discord.js classes
import { Client, Intents, VoiceState } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

import { MessageHandler } from "./handlers/messageHandler";
import { BanHandler, UnbanHandler } from "./handlers/banHandlers";
import { commands, registerSlashCommands } from "./commands";
import { VoiceManager } from "./handlers/VoiceHandler";
import { buttonHandler } from "./handlers/buttonHandler";

let token = process.env.DISCORD_TOKEN;
let config = JSON.parse(process.env.VC_CONFIG);


// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
});
let _voiceManager: VoiceManager;

// When the client is ready, run this code (only once)
client.once("ready", () => {
	console.log("Ready!");

	_voiceManager = new VoiceManager(client);
	//create interval to call into voice manager to check for expired parties/party members
	setInterval(() => {
		_voiceManager.expireParties();
	}, 5000);
});

client.on("interactionCreate", async (interaction) => {
	if (interaction.isCommand()) {
		// give us 15 minutes to respond
		interaction.deferReply({ ephemeral: true }).then(async () => {
			const command = commands.find((c) => (c.name == interaction.commandName));

			if (!command) return;

			try {
				await command.execute(interaction, _voiceManager);
			} catch (error) {
				console.error(error);
				return interaction.editReply({
					content: "There was an error while executing this command!"
				});
			}
		});
	} else if (interaction.isButton()) {
		//dispatch to button handler
		interaction
			.deferReply({ ephemeral: true })
			.then(() => buttonHandler(interaction, _voiceManager));
	}
});

client.on(
	"voiceStateUpdate",
	async (oldState: VoiceState, newState: VoiceState) => {
		let newUserChannel = newState.channel;
		let oldUserChannel = oldState.channel;

		if (
			newUserChannel?.id === process.env.VOICE_START_CHANNEL_ID
		) {
			// User Joins the start channel, go check (in the voice manager) if they're in a party already
			_voiceManager.userJoinedStartChannel(newState.member);
		}
	}
);

registerSlashCommands(token);
console.log("Registered commands");

// Login to Discord with your client's token
client.login(token);

client.on("messageCreate", MessageHandler(client, _voiceManager));

client.on("guildBanAdd", BanHandler(client));

client.on("guildBanRemove", UnbanHandler(client));
