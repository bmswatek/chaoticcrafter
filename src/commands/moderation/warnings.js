const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Checks a member's warnings")
    .addUserOption(option => option.setName('target').setDescription('The user you would like to check the warnings of').setRequired(true)),
    async execute (interaction) {

        const member = interaction.options.getUser('target');
        let warns = await db.get(`warns_${member}`);

        if (warns == null) warns = 0;

        const embed = new EmbedBuilder()
        .setColor(0XCE3E43)
        .setDescription(`:white_check_mark: ${member.tag} has **${warns}** warning(s)`)

        await interaction.reply({ embeds: [embed] });

    }
}