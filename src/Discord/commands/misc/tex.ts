import fetch from "node-fetch";

import { Client, Message } from "discord.js";

import { Command } from "Discord/commands/types";
import { oneLine } from "Shared/stringUtil";

export default {
	identifier: "TeX",
	group: "Miscellaneous",
	aliases: ["latex"],
	patterns: [/\$(.+)\$/],
	description: "Renders a given TeX expression and posts the output.",
	details: oneLine(`
		This command will only render valid **TeX** expressions.
		Advanced LaTeX tags such as \`\\usepackage\` or \`\\align\` will not work.
	`),
	examples: ["!latex y = \\sum_{x=0}^{10} x^5", "$\\frac{n^2 + n}{n}$"],
	arguments: [
		{
			name: "expression",
			type: "string",
			prompt: "supply an expression for me to render.",
			infinite: true,
			matchGroupIndex: 1,
		},
	],
	func: async (client: Client, message: Message, result: { expression: string }) => {
		const reply = await message.reply(`processing...`);

		let image,
			error = "Unknown";
		try {
			const res = await fetch(`https://latex2image.joeraut.com/convert`, {
				method: "POST",
				body: new URLSearchParams([
					["latexInput", result.expression],
					["outputScale", "500%"],
					["outputFormat", "JPG"],
				]),
			});

			const json = await res.json();
			if (json.imageURL) image = `https://latex2image.joeraut.com/${json.imageURL}`;
			else if (json.error) error = json.error;
		} catch (e) {
			if (e instanceof Error) {
				error = e.message;
			}
		}

		if (image) {
			reply.delete();
			return message.channel.send({
				files: [
					{
						attachment: image,
						name: "tex.jpg",
					},
				],
			});
		} else {
			return reply.edit(`Unable to convert TeX to JPG.`, {
				code: error,
			});
		}
	},
} as Command;
