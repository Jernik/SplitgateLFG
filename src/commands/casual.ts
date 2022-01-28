import { SlashCommandBuilder } from "@discordjs/builders";
import {
	CommandInteraction,
	GuildMember,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import { VoiceManager } from "../handlers/VoiceHandler";

let create = {
	name: "create",
	data: new SlashCommandBuilder()
		.setName("create")
		.setDescription("create a party")
		.addNumberOption((option) =>option.setName("size").setDescription("size of party").setRequired(true))
		.addStringOption((option) =>option.setName("type").setDescription("type of party (ranked, casual, etc)").setRequired(true))
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("short description of your party")
		),
	async execute(interaction: CommandInteraction, voiceManager: VoiceManager) {
		const description = interaction.options.getString("description") ?? "";
		let size = interaction.options.getNumber("size", true);
		if(size < 2) size = 2;
		if(size > 10) size = 10;
		const partyType = interaction.options.getString("type", true);
		//get GuildMember object from interaction
		if (interaction.member instanceof GuildMember) {
			let partyId = voiceManager.getPartyId(interaction.member);
			if (partyId) {
				interaction.editReply({
					content:
						"You are already in a party! Please leave or disband it using the /leave command before creating a new party.",
				});
				return;
			}

			if (interaction.member.voice?.channelId) {
				let errorMessage = await voiceManager.createParty(interaction.member, partyType, description, size);
				if(!errorMessage) {
				interaction.editReply(
					`You have created this party! I've automatically moved you to the VC, but if you get disconnected, join <#${process.env.VOICE_START_CHANNEL_ID}> to be reconnected.`
				);
				} else {
					interaction.editReply(`Error creating party - ${errorMessage}`);
				}
			} else {
				interaction.editReply({
					content: `You must be in <#${process.env.VOICE_START_CHANNEL_ID}> to create a party.`,
				});
			}
		} else {
			//todo figure out how to get the member object from the APIGuildMember object ig
		}
	},
};

export { create  };
