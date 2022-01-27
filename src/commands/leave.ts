import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { VoiceManager } from "../handlers/VoiceHandler";

let leave = {
	name: "leave",
	data: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("leave your current party"),
	async execute(interaction: CommandInteraction, voiceManager: VoiceManager) {
		interaction.reply({
			content: `you left your current party`,
			ephemeral: true,
		});
		//get GuildMember object from interaction
		if (interaction.member instanceof GuildMember) {
			voiceManager.removeFromParty(interaction.member);
		} else {
			//todo figure out how to get the member object from the APIGuildMember object ig
		}
	},
};

export { leave };
