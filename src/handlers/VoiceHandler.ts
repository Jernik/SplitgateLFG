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
	channels: Array<ChannelEntry>;
	listingChannel: TextChannel;
	constructor(client: Client) {
		this.client = client;
		let config = JSON.parse(process.env.VC_CONFIG);

		this.listingChannel = this.client.channels.resolve(
			config.casual.listing_channel_id
		) as TextChannel;

		this.channels = [];
		console.log(process.env.server_id);
		let guild = this.client.guilds.resolve(process.env.server_id);
		let category = guild.channels.resolve(
			config.casual.category_id as Snowflake
		);
		if (category.type === "GUILD_CATEGORY") {
			let narrowedCategory = category as CategoryChannel;
			narrowedCategory.children.forEach((c) => {
				if (c instanceof VoiceChannel) {
					this.channels.push({
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
		let channel = this.channels.find((c) => c.leader == null);
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
		let channel = this.channels.find((c) => c.channel.id == partyId);
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

	//TODO: make this work
	expireParties() {
		// loop through all channels
		// if timeout has passed and leader is there, refresh timeout
		// if timeout has passed and leader is not there, disband party by removing all members,
		// removing leader, and calling discord to disconnect all members from VC
		// loop through all members in channel, if timeout has passed, remove member from channel (if they are not in voice)
		// if timeout has passed and member is in voice, refresh timeout
		// should this be async? It could be pretty long running operation
	}

	userJoinedStartChannel(member: GuildMember) {
		// check to see if this user is already a member of a party, if so, move them into it
		// if not, do nothing
	}

	clearParty(partyId: Snowflake) {
		// locate party by id
		// remove all members from channel
		// remove leader from channel
		// call discord to disconnect all members from VC
	}

	removeFromParty(user: GuildMember) {
		// locate party by user
		// if this user is the leader, disband party, otherwise:
		// remove user from channel
		// remove user from party
		// DM user that they have been removed from party
	}
}

//todo split this into "empty channel" and "party"
type ChannelEntry = {
	channel: VoiceChannel;
	leader: GuildMember | null;
	time: Date | null;
	members: Array<[GuildMember, Date]> | null;
	//todo add blocked users
};

export { VoiceManager };
