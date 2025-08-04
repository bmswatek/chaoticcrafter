const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("What do I do?"),

    async execute(interaction, client) {

        const embed = new EmbedBuilder()
        .setColor(0XCE3E43)
        .setTitle("So what do I really do?")
        .setDescription('My list of current commands are:\n</roll>\n</randomcharacter>\n</randomencounter>\n\nWhy don\'t you give them a try!\n\nTo stay in the loop about the progress join our discord server at:\nhttps://discord.gg/HmvHUwzpwa\n\nThank you for your support!');

        interaction.reply({ embeds: [embed]});

    },
};