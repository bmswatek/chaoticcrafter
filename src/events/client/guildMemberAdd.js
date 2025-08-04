const { EmbedBuilder } = require("@discordjs/builders");
const { GuildMember, Embed } = require("discord.js"); 

module.exports = {
    name: "guildMemberAdd",
    async execute(member, client) {
        if (member.guild.id !== "1157030166078435499") return;
        const {user, guild } = member;
        const welcomeChannel = guild.channels.cache.get('1162869911186587729');
        const welcomeMessage = `Welcome <@${member.id}> to the Chaotic Crafter Server!`;

        const welcomeEmbed = new EmbedBuilder()
        .setTitle("**New member!**")
        .setDescription(welcomeMessage)
        .setColor(0XCE3E43)
        .addFields({name: 'Total members: ', value: `${guild.memberCount}`})
        .setTimestamp();

        welcomeChannel.send({embeds: [welcomeEmbed]});
    },
};