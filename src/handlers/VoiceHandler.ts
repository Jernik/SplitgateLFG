import {
	CategoryChannel,
	Channel,
	Client,
	GuildMember,
	MessageActionRow,
	MessageButton,
	Snowflake,
	TextChannel,
	User,
	VoiceChannel,
} from "discord.js";

const TIMEOUT_IN_MINUTES = 5;
class VoiceManager {
	client: Client<boolean>;
	parties: Array<ChannelEntry>;
	listingChannel: TextChannel;
	constructor(client: Client) {
		this.client = client;
		let config = JSON.parse(process.env.VC_CONFIG);

		this.listingChannel = this.client.channels.resolve(
			config.casual.listing_channel_id
		) as TextChannel;

		this.parties = [];
		console.log(process.env.server_id);
		let guild = this.client.guilds.resolve(process.env.server_id);
		let category = guild.channels.resolve(
			config.casual.category_id as Snowflake
		);
		if (category.type === "GUILD_CATEGORY") {
			let narrowedCategory = category as CategoryChannel;
			narrowedCategory.children.forEach((c) => {
				if (c instanceof VoiceChannel) {
					this.parties.push({
						channel: c,
						leader: null,
						time: null,
						members: null,
					});
				}
			});
		}
	}

	createParty(leader: GuildMember) {
		//todo check if leader is already a party leader, handle that case
		// locate available voice channel
		let channel = this.parties.find((c) => c.leader == null);
		//todo handle if no channel is available
		// update channel map with leader and time
		channel.leader = leader;
		let timeout = new Date();
		timeout.setMinutes(timeout.getMinutes() + TIMEOUT_IN_MINUTES);
		channel.time = timeout;
		channel.members = [[leader, timeout]];
		// move leader to channel
		//todo check to make sure leader is in a voice channel
		leader.voice.setChannel(channel.channel.id as Snowflake);
		// send message to leader
		leader.send(
			`You have created a party! Find it here: <#${channel.channel.id}>`
		);
		//make post in listing channel
		const row = new MessageActionRow().addComponents(
			new MessageButton()
				//stuff the channel id in the button so we know which channel to join when the button is clicked
				.setCustomId(channel.channel.id)
				.setLabel("Join now!")
				.setStyle("PRIMARY")
		);
		this.listingChannel.send({
			content: `<@${leader.id}> created a party!`,
			components: [row],
		});
	}
	joinParty(member: GuildMember, partyId: Snowflake) {
		//todo check if member is already in a party, handle that case
		// locate party by id
		let channel = this.parties.find((c) => c.channel.id == partyId);
		//todo handle if no party is found
		// move member to channel
		member.voice.setChannel(channel.channel.id as Snowflake);
		// update channel map with member
		let timeout = new Date();
		timeout.setMinutes(timeout.getMinutes() + TIMEOUT_IN_MINUTES);
		channel.members.push([member, timeout]);
		// send message to member
		member.send(`You have joined a party!`);
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
					if (channel.leader?.voice?.channel.id !== channel.channel.id) {
						this.clearParty(channel.channel.id);
					} else {
						channel.time = refreshed;
					}
				}
				channel.members.forEach((member) => {
					if (now > member[1]) {
						if (member[0].voice.channel.id !== channel.channel.id) {
							this.removeFromParty(member[0]);
						}
					} else {
						member[1] = refreshed;
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
			member.voice.setChannel(party.channel.id as Snowflake);
			member.send(`You have rejoined a party!`);
		}
		// if not, do nothing
	}

	clearParty(partyId: Snowflake) {
		// locate party by id
		let party = this.parties.find((c) => c.channel.id == partyId);
		// call discord to disconnect all members from VC
		party.members.forEach((m) => m[0].voice.disconnect());
		party.members.forEach((m) => m[0].send(`Your party has been disbanded.`));
		// remove all members from channel
		party.members = null;
		// remove leader from channel
		party.leader = null;
		party.time = null;
	}

	// todo consider adding a "reason" to this function
	removeFromParty(member: GuildMember) {
		// locate party by user
		let party = this.parties
			.filter((p) => p.members != null)
			.find((c) => c.members.some((m) => m[0].id === member.id));
		// if this user is the leader, disband party, otherwise:
		if (party.leader.id === member.id) {
			this.clearParty(party.channel.id);
		} else {
			// remove user from channel
			member.voice.disconnect();
			// remove user from party
			party.members = party.members.filter((m) => m[0].id !== member.id);
			// DM user that they have been removed from party
			member.send(`You have been removed from the party.`);
		}
	}

	isPartyLeader(member: GuildMember) {
		let party = this.parties.find((p) => p.leader?.id === member.id);
		return !!party;
	}

	isInPartyOf(guildMember: GuildMember, leader: GuildMember) {
		let party = this.parties.find((p) => p.leader.id === leader.id);
		return party?.members?.some((m) => m[0].id === guildMember.id);
	}
}

//todo split this into "empty channel" and "party"
type ChannelEntry = {
	channel: VoiceChannel;
	leader: GuildMember | null;
	time: Date | null;
	//todo change this to be an actual type of GuildMemberWithTimeout.
	members: Array<[GuildMember, Date]> | null;
	//todo add blocked users
};

export { VoiceManager };
