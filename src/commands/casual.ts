import { SlashCommandBuilder } from "@discordjs/builders";
import {
	CommandInteraction,
	GuildMember,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import { VoiceManager } from "../handlers/VoiceHandler";

let casual = {
	name: "casual",
	data: new SlashCommandBuilder()
		.setName("casual")
		.setDescription("create a casual party")
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("short description of your party")
		),
	async execute(interaction: CommandInteraction, voiceManager: VoiceManager) {
		const description = interaction.options.getString("description");
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
				await voiceManager.createParty(interaction.member, "casual", description);
				interaction.editReply(
					`You have created this party! I've automatically moved you to the VC, but if you get disconnected, join <#${process.env.VOICE_START_CHANNEL_ID}> to be reconnected.`
				);
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

export { casual };
