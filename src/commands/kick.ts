import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { VoiceManager } from "../handlers/VoiceHandler";

let kick = {
	name: "kick",
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription("kick a user from your party")
		.addUserOption((option) =>
			option.setName("user").setDescription("user to kick from your party")
		),
	async execute(interaction: CommandInteraction, voiceManager: VoiceManager) {
		const user = interaction.options.getUser("user");

		//lookup guild member from user
		//todo this might need to be changed how to look up the member object
		let guildMember = interaction.guild.members.cache.find(
			(member) => member.id === user.id
		);
		if (interaction.member instanceof GuildMember) {
			if (voiceManager.isPartyLeader(interaction.member)) {
				if (voiceManager.isInPartyOf(guildMember, interaction.member)) {
					voiceManager.removeFromParty(guildMember);
					interaction.editReply({
						content: `you kicked ${user.username} from your party`,
					});
				} else {
					interaction.editReply({
						content: `that user is not in your party`,
					});
				}
			} else {
				interaction.editReply({
					content: `you are not the party leader`,
				});
			}
		} else {
			interaction.editReply({
				content: `unable to locate user`,
			});
		}
	},
};

export { kick };
