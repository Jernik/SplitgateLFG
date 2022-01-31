import {
	GuildMember,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
} from "discord.js";
import { config } from "../config";
import { VoiceManager } from "./VoiceHandler";

let buttonHandler = async (
	interaction: MessageComponentInteraction,
	voiceManager: VoiceManager
) => {
	//determine button type
	let buttonType = interaction.customId.split("_")[0];
	if (buttonType === "join") {
		await handleJoinButton(interaction, voiceManager);
	} else if (buttonType === "transferResponse") {
		await handleTransferResponse(interaction, voiceManager);
	}
};

async function handleJoinButton(
	interaction: MessageComponentInteraction,
	voiceManager: VoiceManager
) {
	let member: GuildMember;
	if (interaction.member instanceof GuildMember) {
		member = interaction.member;
	} else {
		const found = interaction.guild.members.resolve(this.interaction.user?.id);
		if (found) member = found;
	}
	if (member) {
		let partyId = voiceManager.getPartyId(member);
		let requestedPartyId = interaction.customId.split("_")[1];

		if (partyId === requestedPartyId) {
			interaction.editReply(`You're already in that party!`);
			return;
		}
		if (voiceManager.isPartyLeader(member)) {
			interaction.editReply({
				content: `You are already the leader of a party, if you wish to join another, you must disband your current party with the /leave command.`,
			});
			return;
		}
		if (partyId !== null && partyId !== undefined) {
			const row = new MessageActionRow().addComponents(
				new MessageButton()
					//stuff the channel id in the button so we know which channel to join when the button is clicked
					.setCustomId(`transferResponse_yes_${requestedPartyId}`)
					.setLabel("Yes")
					.setStyle("PRIMARY"),
				new MessageButton()
					.setCustomId(`transferResponse_no`)
					.setLabel("No")
					.setStyle("SECONDARY")
			);
			interaction.editReply({
				content:
					"You are already in a party! Would you like to leave that one?",
				components: [row],
			});
			return;
		}
		if (member.voice) {
			let requestedPartyId = interaction.customId.split("_")[1];
			await moveMember(interaction, voiceManager, requestedPartyId);
		}
	} else {
		interaction.editReply({
			content: `Error processing command. (Error 1002)`,
		});
		console.log(
			`unable to locate member object for id ${interaction?.user?.id}`
		);
	}
	//update party listing with "# members/total members"
	//interaction.update("a member joined this party");
	// if # members=total members, disable the button
}

export { buttonHandler };

async function handleTransferResponse(
	interaction: MessageComponentInteraction,
	voiceManager: VoiceManager
) {
	if (interaction.customId.split("_")[1] === "no") {
		interaction.editReply(`Ok, keeping you in the current party!`);
		return;
	}
	if (interaction.member instanceof GuildMember) {
		if (interaction.member.voice) {
			let requestedPartyId = interaction.customId.split("_")[2];
			await moveMember(interaction, voiceManager, requestedPartyId);
		}
	}
}

async function moveMember(
	interaction: MessageComponentInteraction,
	voiceManager: VoiceManager,
	partyId: string
) {
	let member: GuildMember;
	if (interaction.member instanceof GuildMember) {
		member = interaction.member;
	} else {
		const found = interaction.guild.members.resolve(this.interaction.user?.id);
		if (found) member = found;
	}
	if (member) {
		if (member.voice?.channelId) {
			let success = await voiceManager.joinParty(member, partyId);
			if (success) {
				interaction.editReply(
					`You have joined this party! I've automatically moved you to the VC, but if you get disconnected, join <#${config.VOICE_START_CHANNEL_ID}> to be reconnected.`
				);
			} else {
				interaction.editReply(`Unable to join party.`);
			}
		} else {
			interaction.editReply({
				content: `You must be in <#${config.VOICE_START_CHANNEL_ID}> to join a party`,
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
}
