const { SlashCommandBuilder } = require(`@discordjs/builders`);
const {
  EmbedBuilder,
  PermissionsBitField,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require(`discord.js`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("This purges channel messages")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of messages to delete")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    )
      return interaction.reply({
        content: "You don't have permission to do this!",
        ephemeral: true,
      });
    
    let number = interaction.options.getInteger("amount");
    
    // Fetch messages and attempt to delete them
    const fetchedMessages = await interaction.channel.messages.fetch({ limit: number });
    const messagesToDelete = fetchedMessages.filter(msg => {
      // Filter out messages that are older than 14 days
      const now = Date.now();
      const messageAge = now - msg.createdTimestamp;
      return messageAge <= 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    });

    const oldMessagesCount = fetchedMessages.size - messagesToDelete.size;

    try {
      // Attempt to bulk delete the messages
      await interaction.channel.bulkDelete(messagesToDelete, true);
    } catch (error) {
      // Log error to console for debugging
      console.error("Failed to bulk delete messages:", error);
    }

    // Create an embed to inform about the deletion
    const embed = new EmbedBuilder()
      .setColor(0XCE3E43)
      .setDescription(`:white_check_mark: Deleted ${messagesToDelete.size} messages!` +
                      (oldMessagesCount > 0 ? `\n:warning: Could not delete certain messages because they are older than 14 days.` : ''));

    // Create and send the confirmation message with the button
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("purge")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.reply({
      embeds: [embed],
      components: [button],
    });

    // Set up a message component collector
    const collector = message.createMessageComponentCollector();

    collector.on("collect", async (i) => {
      if (i.customId === "purge") {
        if (!i.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
          return;

        interaction.deleteReply();
      }
    });
  },
};
