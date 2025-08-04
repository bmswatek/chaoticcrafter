const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ButtonInteraction, } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Use this command to create a ticket message.'),
    async execute (interaction, client) {

        if (interaction.user.id !== "299915110925860865") return;

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('button')
            .setEmoji('📩')
            .setLabel('Create Ticket')
            .setStyle(ButtonStyle.Secondary),
        )

        const embed = new EmbedBuilder()
        .setColor(0XCE3E43)
        .setTitle("Tickets & Support")
        .setDescription(`Click the button below to talk to staff (create a ticket).`)

        await interaction.reply({ embeds: [embed], components: [button] });

        const collector = await interaction.channel.createMessageComponentCollector();

        collector.on('collect', async i => {

            await i.update({ embeds: [embed], components: [button] });

            const channel = await interaction.guild.channels.create({
                name: `ticket ${i.user.tag}`,
                type: ChannelType.GuildText,
                parent: '1161426990956544070'
            });

            channel.permissionOverwrites.create(i.user.id, { ViewChannel: true, SendMessages: true} );
            channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false, SendMessages: false });
            channel.permissionOverwrites.create('1161705885358379121', { ViewChannel: false, SendMessages: false });

            channel.send({ content: `Welcome to your ticket, ${i.user}. When you are finished here, let the admin know so we can delete the channel.`});
            i.user.send(`Your ticket within ${i.guild.name} has been created. You can view it in ${channel}`).catch(err => {
                return;
            });
        })
    }
}