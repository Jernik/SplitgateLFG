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
		let member: GuildMember;
		if (interaction.member instanceof GuildMember) {
			member = interaction.member;
		} else {
			const found = interaction.guild.members.resolve(
				this.interaction.user?.id
			);
			if (found) member = found;
		}
		if (member) {
			voiceManager.removeFromParty(member);
			interaction.editReply({
				content: `you left or disbanded your current party`,
			});
		} else {
			interaction.editReply({
				content: `Error processing command. (Error 1002)`,
			});
			console.log(`unable to locate member object for id ${interaction?.user?.id}`);
		}
	},
};

export { leave };
