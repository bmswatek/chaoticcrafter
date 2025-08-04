const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clearwarn")
    .setDescription("Clears a member's warnings")
    .addUserOption(option => option.setName('target').setDescription('The user you would like to clear the warnings of').setRequired(true))
    .addNumberOption(option => option.setName('number').setDescription('The number of warnings you want to clear').setRequired(true)),
    async execute (interaction) {

        const member = interaction.options.getUser('target');
        const warnNum = interaction.options.getNumber('number');

        let warns = await db.get(`warns_${member}`);
        if (warns == null) warns = 0;

        if (warnNum > warns) return await interaction.reply({ content: `You can only a clear a max of ${warns} warnings from ${member.tag}`, ephemeral: true});

        let afwarns = await db.sub(`warns_${member}`, warnNum);

        const embed = new EmbedBuilder()
        .setColor(0XCE3E43)
        .setDescription(`:white_check_mark: ${member.tag} now has ${afwarns} warning(s)`)

        await interaction.reply({ embeds: [embed] });

    }
}