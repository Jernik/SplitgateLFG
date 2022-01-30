import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { VoiceManager } from "../handlers/VoiceHandler";

let kick = {
	name: "kick",
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription("kick a user from your party")
		.addUserOption((option) =>
			option.setName("user").setDescription("user to kick from your party").setRequired(true)
		),
	async execute(interaction: CommandInteraction, voiceManager: VoiceManager) {
		const targetUser = interaction.options.getUser("user");
		// check if target is the same as the user who sent the command
		// if (user.id === interaction.member.user.id) {
		// 	interaction.editReply(`You can't kick yourself!`)
		// }

		//lookup guild member from user
		//todo this might need to be changed how to look up the member object
		let targetGuildMember = interaction.guild.members.cache.find(
			(member) => member.id === targetUser.id
		);
		let member : GuildMember;
		if(interaction.member instanceof GuildMember){
			member = interaction.member;
		}else{
			const found = interaction.guild.members.resolve(this.interaction.user?.id);
			if (found) member = found;
		}
		if (member) {
			if (voiceManager.isPartyLeader(member)) {
				if (voiceManager.isInPartyOf(targetGuildMember, member)) {
					voiceManager.removeFromParty(targetGuildMember, `You have been kicked from your party.`);
					interaction.editReply({
						content: `you kicked ${targetUser.username} from your party`,
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
				content: `Error processing command. (Error 1002)`,
			});
			console.log(
				`unable to locate member object for id ${interaction?.user?.id}`
			);
		}
	},
};

export { kick };
