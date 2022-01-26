// Require the necessary discord.js classes
import { Client, Intents } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

import { MessageHandler } from "./handlers/messageHandler";
import { BanHandler, UnbanHandler } from "./handlers/banHandlers";
import { commands, registerSlashCommands } from "./commands";
import { VoiceManager } from "./handlers/VoiceHandler";
import { buttonHandler } from "./handlers/buttonHandler";

let token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_BANS,
	],
});
let _voiceManager: VoiceManager;

// When the client is ready, run this code (only once)
client.once("ready", () => {
	console.log("Ready!");

	_voiceManager = new VoiceManager(client);
});

client.on("interactionCreate", async (interaction) => {
	if (interaction.isCommand()) {
		const command = commands.find((c) => (c.name = interaction.commandName));

		if (!command) return;

		try {
			await command.execute(interaction, _voiceManager);
		} catch (error) {
			console.error(error);
			return interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		}
	}else if(interaction.isButton()){
		//dispatch to button handler
		buttonHandler(interaction, _voiceManager);
	}
});

registerSlashCommands(token);
console.log("Registered commands");

// Login to Discord with your client's token
client.login(token);

client.on("messageCreate", MessageHandler(client));

client.on("guildBanAdd", BanHandler(client));

client.on("guildBanRemove", UnbanHandler(client));
