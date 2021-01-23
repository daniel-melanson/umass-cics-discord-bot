import { Client, Message } from "discord.js";

import { Command } from "Discord/commands/types";

export default {
	identifier: "ping",
	group: "Utility",
	description: "Responds to the invoking message with information about latency.",
	examples: ["!ping"],
	func: async (client: Client, message: Message) => {
		throw new Error("not implemented");
	},
} as Command;
