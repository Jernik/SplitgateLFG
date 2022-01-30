import { SlashCommandBuilder } from "@discordjs/builders";
import {
	CommandInteraction,
	GuildMember,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import { VoiceManager } from "../handlers/VoiceHandler";
import {config} from "../config";

let create = {
	name: "create",
	data: new SlashCommandBuilder()
		.setName("create")
		.setDescription("create a party")
		.addNumberOption((option) =>option.setName("size").setDescription("size of party").setRequired(true))
		.addStringOption((option) =>option.setName("type").setDescription("type of party (ranked, casual, etc)"))
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("short description of your party")
		),
	async execute(interaction: CommandInteraction, voiceManager: VoiceManager) {
		const limit = 4000;
		let description = interaction.options.getString("description") ?? "";
		let size = interaction.options.getNumber("size", true);
		if(size < 2) size = 2;
		if(size > 10) size = 10;
		let partyType = interaction.options.getString("type");
		description = description?.substring(0, limit);
		partyType = partyType?.substring(0, limit);
		//get GuildMember object from interaction
		let member : GuildMember;
		if(interaction.member instanceof GuildMember){
			member = interaction.member;
		}else{
			const found = interaction.guild.members.resolve(this.interaction.user?.id);
			if (found) member = found;
		}
		if (member) {
			let partyId = voiceManager.getPartyId(member);
			if (partyId) {
				interaction.editReply({
					content:
						"You are already in a party! Please leave or disband it using the /leave command before creating a new party.",
				});
				return;
			}

			if (member.voice?.channelId) {
				let errorMessage = await voiceManager.createParty(member, partyType, description, size);
				if(!errorMessage) {
				interaction.editReply(
					`You have created this party! I've automatically moved you to the VC, but if you get disconnected, join <#${config.VOICE_START_CHANNEL_ID}> to be reconnected.`
				);
				} else {
					interaction.editReply(`Error creating party - ${errorMessage}`);
				}
			} else {
				interaction.editReply({
					content: `You must be in <#${config.VOICE_START_CHANNEL_ID}> to create a party.`,
				});
			}
		} else {
			interaction.editReply({
				content: `Error processing command. (Error 1002)`,
			});
			console.log(
				`unable to locate member object for id ${interaction?.user?.id}`
			);
		}
	},
};

export { create  };
