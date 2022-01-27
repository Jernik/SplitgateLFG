import { Client, Message } from "discord.js";
import { VoiceManager } from "./VoiceHandler";

//todo move these to config
const modRoleIds = [
	//splitgate main
	"358341736143257602", //moderator
	"485530182732611585", //admin
	//test server
	"936332417768247347", //moderator
	"936332453075910717", //admin
];
const commandChannelIds = ["475299254739402763", "871014690434736128"];

const prefix = "#";

//commands:
// clear party
let clearParty = (args: string, voiceManager: VoiceManager) => {
	let partyId = args.split(" ")[0];
	voiceManager.clearParty(partyId);
	return `party ${partyId} cleared`;
};
// clear party member
//todo move this into the kick slash command?
let kick = (args: string, voiceManager: VoiceManager, client: Client) => {
	let memberId = args.split(" ")[0];
	let guildMember = client.guilds.cache.first().members.cache.get(memberId);
	voiceManager.removeFromParty(guildMember);
	return `you kicked ${guildMember.user.username} from their party`;
};
// clearall parties (reset bot state without restarting bot)
let clearAll = (args: string, voiceManager: VoiceManager) => {
	voiceManager.resetAll();
	return `you have cleared all parties`;
};
// send message to all users, post in listing channel, and remove all members from VC

let commandMap = new Map<
	string,
	(args: string, voiceManager: VoiceManager, client: Client) => string
>([
	["clear", clearParty],
	["kick", kick],
	["clearall", clearAll],
]);

let MessageHandler =
	(client: Client, voiceManager: VoiceManager) => (message: Message) => {
		// check if message is from a bot
		if (message.author.bot) {
			return;
		} // check if the message starts with the prefix
		if (!message.content.startsWith(prefix)) {
			return;
		}
		// mod commands go here
		if (
			modRoleIds.filter((id) => message.member.roles.cache.has(id)).length >
				0 &&
			commandChannelIds.includes(message.channel.id)
		) {
			//lookup and execute command
			let command = message.content.split(" ")[0].substring(prefix.length);
			try {
				let responseMessage = commandMap.get(command.toLowerCase())(
					message.content.substring(prefix.length + command.length + 1),
					voiceManager,
					client
				);
				message.reply(responseMessage);
			} catch (e) {
				console.log(e);
				message.reply("error executing command");
			}
		}
	};

export { MessageHandler };
