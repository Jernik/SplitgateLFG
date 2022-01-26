import {SlashCommandBuilder} from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';
import { VoiceHandler } from '../handlers/VoiceHandler';

let casual = {
    name: "casual",
    data: new SlashCommandBuilder()
    .setName('casual')
    .setDescription('create a casual party')
    .addStringOption(option=>option.setName('elo').setDescription('elo of the party leader')),
    async execute(interaction:CommandInteraction, voiceHandler:VoiceHandler){
        const elo = interaction.options.get('elo');
        interaction.reply({ content:`you created a casual party with elo ${elo.value}`, ephemeral:true});
        //get GuildMember object from interaction
        if(interaction.member instanceof GuildMember){
            voiceHandler.createParty(interaction.member);
        }else{
            //todo figure out how to get the member object from the APIGuildMember object ig
        }
    }
}

export { casual };