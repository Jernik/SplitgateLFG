const guildConfigs = [
	{
		//Splitgate
		guildId: "327997395650740225",
		logChannelId: "876489798846676992",
	},
	{
		//Splitgate LFG
		guildId: "871552815246495808",
		logChannelId: "898245327549759498",
	},
	{
		//jernik test
		guildId: "361634430626037770",
		logChannelId: "475299254739402763",
	},
	{
		//jernik second test
		guildId: "898217693746982933",
		logChannelId: "898217694451617804",
	},
];
let guildIds = guildConfigs.map((g) => g.guildId);

export type GuildConfig = typeof guildConfigs[0];

export { guildConfigs, guildIds };
