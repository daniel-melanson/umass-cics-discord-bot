import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder";
import { MessageEmbedBuilder } from "../../builders/MessageEmbedBuilder";

let optionVoteBuilder = new SlashCommandBuilder()
  .setName("option-vote")
  .setDescription("Create a multiple choice poll in the current channel.")
  .addStringOption(option =>
    option.setName("question").setDescription("The question you would like to pose.").setRequired(true),
  );

const REACTION_EMOJIS = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫"];

for (let i = 0; i < REACTION_EMOJIS.length; i++) {
  optionVoteBuilder = optionVoteBuilder.addStringOption(option =>
    option
      .setName("choice-" + i)
      .setDescription(`A response to the answer.`)
      .setRequired(i < 2),
  );
}

export default optionVoteBuilder.setCallback(async interaction => {
  const options = interaction.options;

  const choices = [];
  for (let i = 0; i < REACTION_EMOJIS.length; i++) {
    const choice = options.getString("choice-" + i);

    if (choice) {
      choices.push(choice);
    }
  }

  const fields = [];
  for (let i = 0; i < choices.length; i++) {
    fields.push({
      name: `${REACTION_EMOJIS[i]} **${choices[i].trim()}**`,
      value: "‎‎",
    });
  }

  await interaction.reply({
    embeds: [
      new MessageEmbedBuilder()
        .setTitle(options.getString("question", true))
        .setUser(interaction.user)
        .setDescription("Please react to this message with your response.")
        .setFields(fields),
    ],
  });

  const replyish = await interaction.fetchReply();
  const reply = await interaction.channel!.messages.fetch(replyish.id);
  for (let i = 0; i < choices.length; i++) {
    await reply.react(REACTION_EMOJIS[i]);
  }
});
