import { Client, Message } from "discord.js";
import { VoiceManager } from "./VoiceHandler";

let MessageHandler = (client: Client, voiceManager:VoiceManager) => (message: Message) => {
	// mod commands go here
	// check if the user executing them is a mod
	// check if the channel it is in is #bot-commands
	// check if the message starts with the prefix 
	// dispatch command to command handler (to be defined)
};

export { MessageHandler };
