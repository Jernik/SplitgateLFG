
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { create } from "./casual";
import { kick } from "./kick";
import { leave } from "./leave";
import {config} from "../config";

const commands = [create, kick, leave];

let registerSlashCommands = (token: string) => {
	const clientId = config.CLIENT_ID;
	const guildId = config.SERVER_ID;

	let commandsToRegister = commands.map((c) => c.data);

	const rest = new REST({ version: "9" }).setToken(token);

	(async () => {
		try {
			console.log("Started refreshing application (/) commands.");

			await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
				body: commandsToRegister,
			});

			console.log("Successfully reloaded application (/) commands.");
		} catch (error) {
			console.error(error);
		}
	})();
};

export { commands, registerSlashCommands };