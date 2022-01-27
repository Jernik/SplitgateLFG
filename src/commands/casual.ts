import {SlashCommandBuilder} from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';
import { VoiceManager } from '../handlers/VoiceHandler';

let casual = {
	name: "casual",
	data: new SlashCommandBuilder()
		.setName("casual")
		.setDescription("create a casual party")
		.addStringOption((option) =>
			option.setName("elo").setDescription("elo of the party leader")
		),
	async execute(interaction: CommandInteraction, voiceManager: VoiceManager) {
		const elo = interaction.options.get("elo");
		interaction.reply({
			content: `you created a casual party with elo ${elo.value}`,
			ephemeral: true,
		});
		//get GuildMember object from interaction
		if (interaction.member instanceof GuildMember) {
			voiceManager.createParty(interaction.member);
		} else {
			//todo figure out how to get the member object from the APIGuildMember object ig
		}
	},
};

export { casual };