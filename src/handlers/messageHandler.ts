import { Client, Message } from "discord.js";
import { config } from "../config";
import { VoiceManager } from "./VoiceHandler";

const modRoleIds = config.MODERATOR_ROLE_IDS;
const commandChannelIds = config.COMMAND_CHANNEL_IDS;

const prefix = "#";

//commands:
// clear party
let clearParty = async (args: string, voiceManager: VoiceManager) => {
	let partyId = args.split(" ")[0];
	// allow moderator to reference channel by mentioning it
	if (partyId.startsWith("<#") && partyId.endsWith(">")) {
		partyId = partyId.slice(2, -1);
	}
	voiceManager.clearParty(partyId);
	return `party ${partyId} cleared`;
};
// clear party member
//todo move this into the kick slash command?
let kick = async (args: string, voiceManager: VoiceManager, client: Client) => {
	let memberId = args.split(" ")[0];
	let guildMember = client.guilds.cache.first().members.cache.get(memberId);
	await voiceManager.removeFromParty(
		guildMember,
		`You have been kicked from your party`
	);
	return `you kicked ${guildMember.user.username} from their party`;
};
// clearall parties (reset bot state without restarting bot)
let clearAll = async (args: string, voiceManager: VoiceManager) => {
	voiceManager.resetAll();
	return `you have cleared all parties`;
};
// send message to all users, post in listing channel, and remove all members from VC

let commandMap = new Map<
	string,
	(args: string, voiceManager: VoiceManager, client: Client) => Promise<string>
>([
	["clear", clearParty],
	["kick", kick],
	["clearall", clearAll],
]);

let MessageHandler =
	(client: Client, voiceManager: VoiceManager) => async (message: Message) => {
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
				let responseMessage = await commandMap.get(command.toLowerCase())(
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
