const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomencounter')
    .setDescription('Generate a random D&D Monster Encounter'),
  async execute(interaction) {
    try {
      const randomMonster = await fetchRandomMonster();
      const monsterDetails = await fetchMonsterDetails(randomMonster.url);

      const { specialAbilities, actions } = formatMonsterDetails(monsterDetails);

      const specialAbilitiesPages = paginate(specialAbilities, 5);
      const actionsPages = paginate(actions, 5);

      let currentPage = 0;
      let totalPages = actionsPages.length;
      let currentSection = 'actions';

      const mainEmbed = buildMainEmbed(monsterDetails);
      let detailsEmbed = buildDetailsEmbed(actionsPages[currentPage], 'Actions', monsterDetails);
      const row = createActionRow(currentPage, totalPages, currentSection);

      const message = await interaction.reply({ embeds: [mainEmbed, detailsEmbed], components: [row], fetchReply: true });

      const filter = i => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        if (i.customId === 'next') {
          if (currentPage < totalPages - 1) {
            currentPage++;
          }
        } else if (i.customId === 'prev') {
          if (currentPage > 0) {
            currentPage--;
          }
        } else if (i.customId === 'toggle') {
          currentSection = currentSection === 'actions' ? 'special_abilities' : 'actions';
          totalPages = currentSection === 'actions' ? actionsPages.length : specialAbilitiesPages.length;
          currentPage = 0;
          row.components[2].setLabel(currentSection === 'actions' ? 'Toggle to Special Abilities' : 'Toggle to Actions');
        }

        detailsEmbed = buildDetailsEmbed(
          currentSection === 'actions' ? actionsPages[currentPage] : specialAbilitiesPages[currentPage],
          currentSection === 'actions' ? 'Actions' : 'Special Abilities',
          monsterDetails
        );
        updateActionRow(row, currentPage, totalPages);

        await i.update({ embeds: [mainEmbed, detailsEmbed], components: [row] });
      });

      collector.on('end', collected => {
        row.components.forEach(button => button.setDisabled(true));
        message.edit({ components: [row] });
      });

    } catch (error) {
      console.error('Error executing random encounter command:', error);
      await interaction.reply('Error executing random encounter command. Please try again later.');
    }
  },
};

async function fetchRandomMonster() {
  const response = await axios.get('https://www.dnd5eapi.co/api/monsters');
  const { count, results } = response.data;
  const randomIndex = Math.floor(Math.random() * count);
  return results[randomIndex];
}

async function fetchMonsterDetails(url) {
  const response = await axios.get(`https://www.dnd5eapi.co${url}`);
  return response.data;
}

function formatMonsterDetails(monsterDetails) {
  const conditionImmunities = monsterDetails.condition_immunities?.map(obj => obj.name).join(", ") || 'None';

  const skills = monsterDetails.proficiencies?.filter(proficiency => proficiency.proficiency.index.startsWith('skill-'))
    .map(skill => `${skill.proficiency.name.split(': ')[1]}: +${skill.value}`).join(", ") || 'None';

  const specialAbilities = monsterDetails.special_abilities?.length
    ? monsterDetails.special_abilities.map(ability => `**${ability.name}**: ${ability.desc}`)
    : ['None'];

  const actions = monsterDetails.actions?.length
    ? monsterDetails.actions.map(action => `**${action.name}**: ${action.desc}`)
    : ['None'];

  return { specialAbilities, actions, conditionImmunities, skills };
}

function paginate(array, pageSize) {
  const pages = [];
  for (let i = 0; i < array.length; i += pageSize) {
    pages.push(array.slice(i, i + pageSize));
  }
  return pages;
}

function buildMainEmbed(monsterDetails) {
  return new EmbedBuilder()
    .setTitle(`${monsterDetails.name}`)
    .setColor(0XCE3E43)
    .setDescription(`*${monsterDetails.size || 'Unknown'} ${monsterDetails.type || 'Unknown'}, ${monsterDetails.alignment || 'Unknown'}*\n\n` +
      `**Armor Class**: ${monsterDetails.armor_class?.map(ac => `${ac.type} ${ac.value}`).join(", ") || 'None'}\n` +
      `**Hit Points**: ${monsterDetails.hit_points || 'Unknown'}\n` +
      `**Speed**: ${Object.entries(monsterDetails.speed || {}).map(([key, value]) => `${key} ${value}`).join(", ") || 'Unknown'}\n\n` +
      `**STR**: ${monsterDetails.strength || 'Unknown'}    **DEX**: ${monsterDetails.dexterity || 'Unknown'}    **CON**: ${monsterDetails.constitution || 'Unknown'}\n` +
      `**INT**: ${monsterDetails.intelligence || 'Unknown'}    **WIS**: ${monsterDetails.wisdom || 'Unknown'}    **CHA**: ${monsterDetails.charisma || 'Unknown'}\n\n` +
      `**Saving Throws**: ${monsterDetails.proficiencies?.filter(proficiency => proficiency.proficiency.index.startsWith('saving-throw'))
        .map(proficiency => `${proficiency.proficiency.name.split(': ')[1]}: +${proficiency.value}`).join(", ") || 'None'}\n` +
      `**Skills**: ${monsterDetails.skills || 'None'}\n` +
      `**Languages**: ${monsterDetails.languages || 'None'}\n` +
      `**Senses**: Passive Perception ${monsterDetails.senses?.passive_perception || 'Unknown'}\n` +
      `**Challenge Rating**: ${monsterDetails.challenge_rating || 'Unknown'} (${monsterDetails.xp || 'Unknown'} XP)\n\n` +
      `**Damage Vulnerabilities**: ${monsterDetails.damage_vulnerabilities?.join(", ") || 'None'}\n` +
      `**Damage Resistances**: ${monsterDetails.damage_resistances?.join(", ") || 'None'}\n` +
      `**Damage Immunities**: ${monsterDetails.damage_immunities?.join(", ") || 'None'}\n` +
      `**Condition Immunities**: ${monsterDetails.condition_immunities?.map(obj => obj.name).join(", ") || 'None'}`)
    .setImage(monsterDetails.image ? `https://www.dnd5eapi.co${monsterDetails.image}` : null);
}

function buildDetailsEmbed(page, title, monsterDetails) {
  return new EmbedBuilder()
    .setTitle(`${title}`)
    .setColor(0XCE3E43)
    .setDescription(`${page.join("\n")}\n[API Entry](https://www.dnd5eapi.co${monsterDetails.url})`);
}

function createActionRow(currentPage, totalPages, currentSection) {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage >= totalPages - 1),
      new ButtonBuilder()
        .setCustomId('toggle')
        .setLabel(currentSection === 'actions' ? 'Toggle to Special Abilities' : 'Toggle to Actions')
        .setStyle(ButtonStyle.Secondary)
    );
}

function updateActionRow(row, currentPage, totalPages) {
  row.components[0].setDisabled(currentPage === 0); // Previous button
  row.components[1].setDisabled(currentPage >= totalPages - 1); // Next button
}
