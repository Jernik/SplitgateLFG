import { GuildMember, MessageComponentInteraction } from "discord.js";
import { VoiceManager } from "./VoiceHandler";

let buttonHandler = (interaction : MessageComponentInteraction, voiceManager:VoiceManager)=>{
	//todo find the member that clicked this
	//todo add voicemanager method to move member into party
	//get GuildMember object from interaction
	if (interaction.member instanceof GuildMember) {
		voiceManager.joinParty(interaction.member, interaction.customId);
	} else {
		//todo figure out how to get the member object from the APIGuildMember object ig
	}
    interaction.editReply("You have joined this party");
	//update party listing with "# members/total members"
    //interaction.update("a member joined this party");
	// if # members=total members, delete the button
}

export {buttonHandler};