
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { create } from "./casual";
import { kick } from "./kick";
import { leave } from "./leave";

const commands = [create, kick, leave];

let registerSlashCommands = (token: string) => {
	// Place your client and guild ids here
	//todo move these to config
	const clientId = "935263984934871050";
	const guildId = "361634430626037770";

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