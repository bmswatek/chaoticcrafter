const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js"); 

module.exports = { 
  data: new SlashCommandBuilder() 
    .setName("hello") 
    .setDescription("Im alive?!") 
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

  async execute(interaction) { 
    if (interaction.user.id !== '299915110925860865') return; 
    const message = await interaction.deferReply({ 
      fetchReply: true, 
    });

    const newMessage = `I AM ALIVE!`;
      await interaction.editReply({
        content: newMessage,
    });
  },
};

  // this allows me to set certain commands to be only run in a certain server v
  // if (message.guild.id !== 'TheIdOfYourGuild') return message.reply('This command can only be used in another server.');

   // allows me to set certain users to be able to use certain commands v
   // if (message.author.id !== '299915110925860865') return;