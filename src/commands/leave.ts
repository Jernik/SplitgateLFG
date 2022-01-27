import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { VoiceManager } from "../handlers/VoiceHandler";

let leave = {
	name: "leave",
	data: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("leave or disband your current party"),
	async execute(interaction: CommandInteraction, voiceManager: VoiceManager) {
		//get GuildMember object from interaction
		if (interaction.member instanceof GuildMember) {
			voiceManager.removeFromParty(interaction.member);
			interaction.editReply({
				content: `you left or disbanded your current party`,
			});
		} else {
			//todo figure out how to get the member object from the APIGuildMember object ig
		}
	},
};

export { leave };
