import { Client, Snowflake } from "discord.js";
import { GuildConfig } from "../config";

let safelyLogToChannel =
	(client: Client) => (e: unknown, extraInfo: string, config: GuildConfig) => {
		let fullMessage: string;
		if (e === null) {
			fullMessage = extraInfo;
		} else {
			let message: string;
			if (typeof e === "string") {
				message = e; // works, `e` narrowed to string
			} else if (e instanceof Error) {
				message = e.message; // works, `e` narrowed to Error
			}
			fullMessage = extraInfo + " - " + message;
		}
		console.log(fullMessage);
		let logChannel = client.channels.cache.get(
			config.logChannelId as Snowflake
		);
		if (logChannel.isText()) {
			logChannel.send(fullMessage);
		}
	};

export { safelyLogToChannel };
