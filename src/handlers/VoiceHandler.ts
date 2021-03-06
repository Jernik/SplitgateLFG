import {
	CategoryChannel,
	Channel,
	Client,
	GuildMember,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	Snowflake,
	TextChannel,
	User,
	VoiceChannel,
} from "discord.js";
import { config } from "../config";
import { safeLogCreator } from "../functions/logging";

const TIMEOUT_IN_MINUTES = 1;
class VoiceManager {
	client: Client<boolean>;
	parties: Array<Party>;
	listingChannel: TextChannel;
	safeLog: (e: any) => void;
	constructor(client: Client) {
		this.client = client;
		this.safeLog = safeLogCreator(client);

		this.listingChannel = this.client.channels.resolve(
			config.LISTING_CHANNEL_ID
		) as TextChannel;

		this.parties = [];
		let guild = this.client.guilds.resolve(config.SERVER_ID);
		config.CATEGORY_IDS.forEach((categoryId) => {
			let category = guild.channels.resolve(categoryId);
			if (category.type === "GUILD_CATEGORY") {
				let narrowedCategory = category as CategoryChannel;
				narrowedCategory.children.forEach((c) => {
					if (c instanceof VoiceChannel) {
						this.parties.push({
							channel: c,
							leader: null,
							time: null,
							members: null,
							listingMessage: null,
							partyDetails: null,
						});
					}
				});
			}
		});

		// make sure all of these VCs are empty
		this.parties.forEach((p) => {
			//go through each one and move all members (if any) to the lobby
			p.channel.members.forEach((m) => {
				this.safelyMoveMember(m, config.VOICE_START_CHANNEL_ID);
				this.safelySendDm(
					m,
					`The bot has been restarted and if you were in a party, it has been lost, sorry!`
				);
			});
		});
		//make sure the listing channel is empty
		this.listingChannel.messages.fetch().then((messages) => {
			messages.forEach((m) => {
				//delete all messages by the bot
				if (m.author.id === this.client.user.id) m.delete();
			});
		});
	}

	resetAll() {
		this.parties.forEach((p) => {
			this.clearParty(p.channel.id, true);
		});
	}

	async createParty(
		leader: GuildMember,
		partyType: string,
		partyDescription: string,
		maxPartySize: number
	) {
		//todo check if leader is already a party leader, handle that case
		let existingLeaderParty = this.parties.find(
			(p) => p.leader?.id === leader.id
		);
		if (existingLeaderParty) {
			return `You are already the leader of a party, please disband it and try again.`;
		}
		// locate available voice channel
		let party = this.parties.find((c) => c.leader == null);

		//handle if no channel is available
		if (!party) {
			return "No available channels (Error 1000)";
		}
		// update channel map with leader and time
		party.leader = leader;
		let timeout = new Date();
		timeout.setMinutes(timeout.getMinutes() + TIMEOUT_IN_MINUTES);
		party.time = timeout;
		party.members = [[leader, timeout]];
		// move leader to channel
		if (leader.voice?.channelId) {
			leader.voice.setChannel(party.channel.id as Snowflake); // send message to leader
		} else {
			return "Unknown Error (Error 1001)";
		}
		party.partyDetails = {
			partyType,
			description: partyDescription,
			maxPartySize: maxPartySize,
		};
		//make post in listing channel
		const row = this.buildButtons(party);
		const embed = this.buildEmbed(
			leader,
			partyType,
			partyDescription,
			1,
			maxPartySize
		);

		party.listingMessage = await this.listingChannel.send({
			embeds: [embed],
			components: [row],
		});

		this.safeLog(
			`${leader} - ${leader.id} has created a party titled "${partyDescription}" in channel ${party.channel} - ${party.channel.id}`
		);
		return null;
	}

	private buildButtons(party: Party) {
		let button: MessageButton;
		if (party.members.length < party.partyDetails.maxPartySize) {
			button = new MessageButton()
				//stuff the channel id in the button so we know which channel to join when the button is clicked
				.setCustomId(`join_${party.channel.id}`)
				.setLabel("Join now!")
				.setStyle("PRIMARY");
		} else {
			button = new MessageButton()
				//stuff the channel id in the button so we know which channel to join when the button is clicked
				.setCustomId(`join_${party.channel.id}`)
				.setLabel("Party is Full")
				.setStyle("PRIMARY")
				.setDisabled(true);
		}
		return new MessageActionRow().addComponents(button);
	}

	private buildEmbed(
		leader: GuildMember,
		partyType: string,
		partyDescription: string,
		currentPartySize: number,
		maxPartySize: number
	) {
		return new MessageEmbed()
			.setColor("#0099ff")
			.setTitle(`${leader.displayName}'s party`)
			.setAuthor(
				`${leader.displayName}`,
				leader.displayAvatarURL({ format: "png", dynamic: true })
			)
			.setDescription(partyDescription ?? "")
			.addFields(
				{ name: "Leader", value: `<@${leader.id}>`, inline: false },
				{ name: "Party Type", value: partyType ?? "Casual", inline: false },
				{
					name: "Party Size",
					value: `${currentPartySize}/${maxPartySize}`,
					inline: false,
				}
			)
			.setThumbnail(leader.displayAvatarURL({ format: "png", dynamic: true }))
			.setTimestamp();
	}

	async joinParty(member: GuildMember, partyId: Snowflake) {
		//make sure the member is fresh
		//todo make sure this isn't really slow
		await member.fetch();
		// locate party by id
		let party = this.parties.find((c) => c.channel.id == partyId);
		//check if member is already in party
		let oldParty = this.parties
			.filter((p) => p.members)
			.find((c) => c.members.some((m) => m[0].id == member.id));
		if (oldParty) {
			//remove them from old party
			oldParty.members = oldParty.members.filter((m) => m[0].id != member.id);
		}
		//ensure the party is real
		if (!party || !party.leader) {
			return false;
		}
		// move member to channel
		if (member.voice?.channelId) {
			this.safelyMoveMember(member, party.channel.id);
			// update channel map with member
			let timeout = new Date();
			timeout.setMinutes(timeout.getMinutes() + TIMEOUT_IN_MINUTES);
			party.members.push([member, timeout]);
			// update listing message
			this.updateListingMessage(party);
			this.safeLog(
				`${member} - ${member.id} has joined a party titled "${party.partyDetails.description}" in channel ${party.channel} - ${party.channel.id}`
			);
			return true;
		} else {
			return;
		}
	}
	updateListingMessage(party: Party) {
		if (!party.leader) {
			party?.listingMessage?.delete();
			return;
		}
		party.listingMessage.edit({
			components: [this.buildButtons(party)],
			embeds: [
				this.buildEmbed(
					party.leader,
					party.partyDetails.partyType,
					party.partyDetails.description,
					party.members.length,
					party.partyDetails.maxPartySize
				),
			],
		});
	}

	//TODO should this be async? It could be pretty long running operation
	expireParties() {
		let now = new Date();
		let refreshed = new Date();
		refreshed.setMinutes(refreshed.getMinutes() + TIMEOUT_IN_MINUTES);
		// loop through all channels
		this.parties
			.filter((p) => p.leader != null)
			.forEach((channel) => {
				if (now > channel.time) {
					//get voice status of leader
					if (channel.leader?.voice?.channel?.id !== channel.channel.id) {
						this.clearParty(channel.channel.id);
					} else {
						channel.time = refreshed;
					}
				}
				channel?.members?.forEach(async (member) => {
					if (now > member[1]) {
						if (member[0].voice?.channel?.id !== channel.channel.id) {
							await this.removeFromParty(
								member[0],
								`You have been removed from your party for inactivity.`
							);
						} else {
							member[1] = refreshed;
						}
					}
				});
			});
	}

	userJoinedStartChannel(member: GuildMember) {
		// check to see if this user is already a member of a party, if so, move them into it
		let party = this.parties.find((p) =>
			p.members?.find((m) => m[0].id == member.id)
		);
		if (party) {
			this.safelyMoveMember(member, party.channel.id);
			this.safelySendDm(member, `You have rejoined a party!`);
		}
		// if not, do nothing
	}

	clearParty(partyId: Snowflake, dmLeader=false) {
		// locate party by id
		let party = this.parties.find((c) => c.channel.id == partyId);
		// call discord to disconnect all members from VC
		party?.members?.forEach(async (m) => {
			this.safelyMoveMember(m[0], config.VOICE_START_CHANNEL_ID);
		});
		party?.members
			?.filter((m) => m[0].id !== party.leader.id)
			.forEach((m) =>
				this.safelySendDm(m[0], `Your party has been disbanded.`)
			);
		//also check discord to clear out any dangling members
		party.channel.members.forEach(async (m) => {
			this.safelyMoveMember(m, config.VOICE_START_CHANNEL_ID);
		});

		if(party.leader)
			this.safeLog(`Party by leader ${party.leader} - ${party.leader?.id} in channel ${party.channel} has been disbanded.`);

		party.leader = null;
		this.updateListingMessage(party);
		// remove all members from channel
		party.members = null;
		// remove leader from channel
		party.time = null;
		party.listingMessage = null;
		party.partyDetails = null;
	}

	async removeFromParty(member: GuildMember, message: string = null) {
		// locate party by user
		let party = this.parties
			.filter((p) => p.members != null)
			.find((c) => c.members.some((m) => m[0].id === member.id));
		if (!party) return;
		// if this user is the leader, disband party, otherwise:
		if (party.leader?.id === member.id) {
			this.clearParty(party.channel.id);
		} else {
			// remove user from channel
			this.safelyMoveMember(member, config.VOICE_START_CHANNEL_ID);
			// remove user from party
			party.members = party.members?.filter((m) => m[0].id !== member.id);
			if (message) {
				// DM user that they have been removed from party
				this.safelySendDm(member, message);
			}
			this.updateListingMessage(party);
			this.safeLog(`${member} - ${member.id} has been removed from party.`);
		}
	}

	isPartyLeader(member: GuildMember) {
		let party = this.parties.find((p) => p.leader?.id === member.id);
		return !!party;
	}

	isInPartyOf(guildMember: GuildMember, leader: GuildMember) {
		let party = this.parties.find((p) => p.leader?.id === leader.id);
		return party?.members?.some((m) => m[0].id === guildMember.id);
	}
	getPartyId(member: GuildMember) {
		let party = this.parties.find((p) =>
			p.members?.some((m) => m[0].id === member.id)
		);
		return party?.channel?.id;
	}
	safelyMoveMember(member: GuildMember, channelId: string) {
		if (member.voice?.channelId) {
			try {
				member.voice.setChannel(channelId as Snowflake);
			} catch (e) {
				console.log(e);
			}
		}
	}
	safelySendDm(member: GuildMember, message: string) {
		try {
			member.send(message).catch((e) => console.log("unable to send dm"));
		} catch (e) {
			console.log("unable to send dm");
		}
	}
}

//todo split this into "empty channel" and "party"
type Party = {
	channel: VoiceChannel;
	leader: GuildMember | null;
	time: Date | null;
	//todo change this to be an actual type of GuildMemberWithTimeout.
	members: Array<[GuildMember, Date]> | null;
	listingMessage: Message | null;
	partyDetails: {
		partyType: string;
		description: string;
		maxPartySize: number;
	} | null;
	//todo add blocked users
};

export type PartyType = "casual" | "ranked" | "rankedtakedown" | "other";

export { VoiceManager };
