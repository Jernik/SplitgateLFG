interface ENV {
	DISCORD_TOKEN: string | undefined;
	CLIENT_ID: string | undefined;
	SERVER_ID: string | undefined;
	VOICE_START_CHANNEL_ID: string | undefined;
	LISTING_CHANNEL_ID: string | undefined;
	CATEGORY_IDS: string | undefined;
	MODERATOR_ROLE_IDS:string|undefined;
	COMMAND_CHANNEL_IDS:string|undefined;
	LOG_CHANNEL_ID:string|undefined;
}

interface Config {
	DISCORD_TOKEN: string;
	CLIENT_ID: string;
	SERVER_ID: string;
	VOICE_START_CHANNEL_ID: string;
	LISTING_CHANNEL_ID: string;
	CATEGORY_IDS: string[];
	MODERATOR_ROLE_IDS:string[];
	COMMAND_CHANNEL_IDS:string[];
	LOG_CHANNEL_ID:string;
}

const getConfig = (): ENV => {
	return {
		DISCORD_TOKEN: process.env.DISCORD_TOKEN,
		CLIENT_ID: process.env.CLIENT_ID,
		SERVER_ID: process.env.SERVER_ID,
		VOICE_START_CHANNEL_ID: process.env.VOICE_START_CHANNEL_ID,
		LISTING_CHANNEL_ID: process.env.LISTING_CHANNEL_ID,
		CATEGORY_IDS: process.env.CATEGORY_IDS,
		MODERATOR_ROLE_IDS:process.env.MODERATOR_ROLE_IDS,
		COMMAND_CHANNEL_IDS:process.env.COMMAND_CHANNEL_IDS,
		LOG_CHANNEL_ID:process.env.LOG_CHANNEL_ID,
	};
};

const getSanitzedConfig = (config: ENV): Config => {
	for (const [key, value] of Object.entries(config)) {
		if (value === undefined) {
			throw new Error(`Missing key ${key} in config.env`);
		}
	}
	let parsedConfig = JSON.parse(JSON.stringify(config));
	parsedConfig.CATEGORY_IDS = JSON.parse(config.CATEGORY_IDS);
	parsedConfig.MODERATOR_ROLE_IDS = JSON.parse(config.MODERATOR_ROLE_IDS);
	parsedConfig.COMMAND_CHANNEL_IDS = JSON.parse(config.COMMAND_CHANNEL_IDS);
	return parsedConfig as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export {sanitizedConfig as config};

