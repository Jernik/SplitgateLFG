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
		const user = interaction.options.getUser('user');
		interaction.reply({
			content: `you kicked ${user.username} from your party`,
			ephemeral: true,
		});
        //lookup guild member from user
        //todo this might need to be changed how to look up the member object
        let guildMember = interaction.guild.members.cache.find(member => member.id === user.id);
		voiceManager.removeFromParty(guildMember);
	},
};

export {kick};