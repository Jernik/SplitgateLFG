// Require the necessary discord.js classes
import { Client, Intents } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

import { MessageHandler } from "./handlers/messageHandler";
import { BanHandler, UnbanHandler } from "./handlers/banHandlers";
import { commands } from "./commands";
import { registerSlashCommands } from "./commands/register";
import { VoiceHandler } from "./handlers/VoiceHandler";

let token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_BANS,
	],
});
let _voiceHandler: VoiceHandler;

// When the client is ready, run this code (only once)
client.once("ready", () => {
	console.log("Ready!");
	
	_voiceHandler = new VoiceHandler(client);
});


client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = commands.find(c=>c.name = interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, _voiceHandler);
	} catch (error) {
		console.error(error);
		return interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
	}
});

registerSlashCommands(token);
console.log("Registered commands");

// Login to Discord with your client's token
client.login(token);

client.on("messageCreate", MessageHandler(client));

client.on("guildBanAdd", BanHandler(client));

client.on("guildBanRemove", UnbanHandler(client));
