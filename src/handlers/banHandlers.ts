import { Client, Guild, GuildBan, Snowflake } from "discord.js";

import { guildConfigs, guildIds } from "../config";
import { safelyLogToChannel } from "../functions/errorHandling";

let BanHandler = (client: Client) => async (ban: GuildBan) => {
	console.log("handling ban");
	console.log(ban);
	// let guilds: Guild[];
	// load all guilds the bot has access to
	let guilds = (await client.guilds.fetch()).map((value, key) =>
		client.guilds.resolve(key)
	);
	//console.log(guilds);
	// which guilds is that user already banned on? (can we just try it on all of em?)
	let guildsToBanOn = guilds.filter(
		(i) => guildIds.includes(i.id) || i.id === ban.guild.id
	);
	//console.log(guildsToBanOn);
	guildsToBanOn.forEach(async (g) => {
		try {
			await g.bans.create(ban.user.id as Snowflake, {
				days: 1,
				reason: ban.reason ?? undefined,
			});
			safelyLogToChannel(client)(
				null,
				`"successfully banned ${ban.user.username}"`,
				guildConfigs.find((c) => c.guildId === g.id)
			);
		} catch (e: unknown) {
			safelyLogToChannel(client)(
				e,
				"unable to ban user",
				guildConfigs.find((c) => c.guildId === g.id)
			);
		}
	});
};

let UnbanHandler = (client: Client) => async (unban: GuildBan) => {
	console.log("handling unban");
	console.log(unban);
	// which guilds is that user banned on, and which ones still need it?
	let guilds = (await client.guilds.fetch()).map((value, key) =>
		client.guilds.resolve(key)
	);

	guilds
		.filter((g) => g.id !== unban.guild.id)
		.forEach(async (g) => {
			try {
				await g.bans.remove(
					unban.user.id as Snowflake,
					unban.reason ?? undefined
				);
				safelyLogToChannel(client)(
					`"successfully unbanned ${unban.user.username}"`,
					"",
					guildConfigs.find((c) => c.guildId === g.id)
				);
			} catch (e) {
				safelyLogToChannel(client)(
					e,
					"unable to unban user",
					guildConfigs.find((c) => c.guildId === g.id)
				);
			}
		});
};

export { BanHandler, UnbanHandler };
