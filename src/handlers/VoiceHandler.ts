import {
	CategoryChannel,
	Channel,
	Client,
	GuildMember,
	MessageActionRow,
	MessageButton,
	Snowflake,
	TextChannel,
	VoiceChannel,
} from "discord.js";

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
		channel.time = new Date();
		channel.members = [[leader, new Date()]];
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
	joinParty(member: GuildMember, partyId:Snowflake) {
		//todo check if member is already in a party, handle that case
		// locate party by id
		let channel = this.channels.find((c) => c.channel.id == partyId);
		//todo handle if no party is found
		// move member to channel
		member.voice.setChannel(channel.channel.id as Snowflake);
		// update channel map with member
		channel.members.push([member, new Date()]);
		// send message to member
		member.send(`You have joined a party!`);
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
