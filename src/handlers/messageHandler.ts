import { Client, Message } from "discord.js";

let MessageHandler = (client: Client) => (message: Message) => {
	if (message.author.bot) return;
	if(message.content == "ping")
	message.channel.send("pong");
};

export { MessageHandler };
