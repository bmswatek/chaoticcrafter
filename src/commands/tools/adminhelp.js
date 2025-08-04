const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("adminhelp")
    .setDescription("Display Admin commands")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {

        const embed = new EmbedBuilder()
        .setColor(0XCE3E43)
        .setTitle("Admin Commands:")
        .setDescription('/timeout\n/kick\n/ban\n/purge\n/warn\n/clearwarn\n/warnings\n\nIf you want to ask any questions, feel free to join our discord server at:\nhttps://discord.gg/HmvHUwzpwa\n\nThank you for your support!');

        interaction.reply({ embeds: [embed]});

    }
}