import { GuildMember, MessageComponentInteraction } from "discord.js";
import { VoiceManager } from "./VoiceHandler";

let buttonHandler = (interaction : MessageComponentInteraction, voiceManager:VoiceManager)=>{
	interaction.reply("OW YOU HIT MY HEAD");
	//todo find the member that clicked this
	//todo add voicemanager method to move member into party
	//get GuildMember object from interaction
	if (interaction.member instanceof GuildMember) {
	    voiceManager.joinParty(interaction.member, interaction.customId);
	} else {
		//todo figure out how to get the member object from the APIGuildMember object ig
	}
	//todo (in manager) find the channel that the button corresponds to, move memeber into party
	//update party listing with "# members/total members"
	// if # members=total members, delete the button
}

export {buttonHandler};