// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' });

let token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(token);