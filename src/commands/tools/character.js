const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

// Hit die mappings for different classes
const hitDieMap = {
  'Barbarian': 'd12',
  'Bard': 'd8',
  'Cleric': 'd8',
  'Druid': 'd8',
  'Fighter': 'd10',
  'Paladin': 'd10',
  'Ranger': 'd10',
  'Rogue': 'd8',
  'Sorcerer': 'd6',
  'Warlock': 'd8',
  'Wizard': 'd6',
  'Monk': 'd8'
};

// Stat adjustments by class
const classStatAdjustments = {
  'Barbarian': { strength: 2, dexterity: 1 },
  'Bard': { charisma: 2, dexterity: 1 },
  'Cleric': { wisdom: 2, constitution: 1 },
  'Druid': { wisdom: 2, constitution: 1 },
  'Fighter': { strength: 2, constitution: 1 },
  'Paladin': { strength: 2, charisma: 1 },
  'Ranger': { dexterity: 2, wisdom: 1 },
  'Rogue': { dexterity: 2, intelligence: 1 },
  'Sorcerer': { charisma: 2, constitution: 1 },
  'Warlock': { charisma: 2, constitution: 1 },
  'Wizard': { intelligence: 2, dexterity: 1 },
  'Monk': { dexterity: 2, wisdom: 1 }
};

// Stat adjustments by race
const raceStatAdjustments = {
  'Dwarf': { constitution: 2 },
  'Elf': { dexterity: 2 },
  'Halfling': { dexterity: 2 },
  'Human': { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
  'Dragonborn': { strength: 2, charisma: 1 },
  'Gnome': { intelligence: 2 },
  'Half-Elf': { charisma: 2, dexterity: 1 },
  'Half-Orc': { strength: 2, constitution: 1 },
  'Tiefling': { charisma: 2, intelligence: 1 }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomcharacter')
    .setDescription('Generate a random D&D Character')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Level of the character (1-20)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20)),
  async execute(interaction) {
    try {
      const level = interaction.options.getInteger('level');
      const randomClass = await fetchRandomClass();
      const classDetails = await fetchClassDetails(randomClass.url);
      const className = classDetails.name;
      const randomRace = getRandomRace();
      const raceName = randomRace.name;

      const hitDie = hitDieMap[className];
      if (!hitDie) {
        throw new Error(`Unexpected class name: ${className}`);
      }

      const rawStats = rollStats();
      const adjustedStats = adjustStatsForClassAndRace(rawStats, className, raceName);
      const constitutionScore = adjustedStats[2];
      const rawHitPoints = calculateRawHitPoints(hitDie);
      const hitPoints = calculateHitPoints(hitDie, level, constitutionScore);
      const adjustmentInfo = buildAdjustmentInfo(className, raceName);

      const mainEmbed = buildMainEmbed(classDetails, hitPoints, rawHitPoints, level, adjustedStats, rawStats, adjustmentInfo, raceName);
      const proficienciesEmbed = buildProficienciesEmbed(classDetails);
      const equipmentEmbed = buildEquipmentEmbed(classDetails);
      const proficiencyChoicesEmbed = buildProficiencyChoicesEmbed(classDetails);
      const startingEquipmentOptionsEmbed = buildStartingEquipmentOptionsEmbed(classDetails);

      await interaction.reply({
        embeds: [
          mainEmbed,
          proficienciesEmbed,
          equipmentEmbed,
          proficiencyChoicesEmbed,
          startingEquipmentOptionsEmbed
        ]
      });

    } catch (error) {
      console.error('Error executing random character command:', error);
      await interaction.reply('Error executing random character command. Please try again later.');
    }
  },
};

// Fetch a random class from the D&D API
async function fetchRandomClass() {
  const response = await axios.get('https://www.dnd5eapi.co/api/classes');
  const { count, results } = response.data;
  const randomIndex = Math.floor(Math.random() * count);
  return results[randomIndex];
}

// Fetch class details from the D&D API
async function fetchClassDetails(url) {
  const response = await axios.get(`https://www.dnd5eapi.co${url}`);
  return response.data;
}

// Roll stats using 4d6 drop lowest method
function rollStats() {
  const stats = [];
  for (let i = 0; i < 6; i++) {
    const rolls = [rollDie(), rollDie(), rollDie(), rollDie()];
    rolls.sort((a, b) => b - a);
    stats.push(rolls[0] + rolls[1] + rolls[2]); // Drop the lowest die
  }
  return stats;
}

// Roll a single d6 die
function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

// Get a random race
function getRandomRace() {
  const races = Object.keys(raceStatAdjustments);
  const randomIndex = Math.floor(Math.random() * races.length);
  const name = races[randomIndex];
  return { name };
}

// Adjust stats for both class and race
function adjustStatsForClassAndRace(stats, className, raceName) {
  const classAdjustments = classStatAdjustments[className] || {};
  const raceAdjustments = raceStatAdjustments[raceName] || {};
  const statNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

  return statNames.map((statName, index) => {
    const baseStat = stats[index];
    const classAdjustment = classAdjustments[statName] || 0;
    const raceAdjustment = raceAdjustments[statName] || 0;
    return baseStat + classAdjustment + raceAdjustment;
  });
}

// Calculate raw hit points considering hit die
function calculateRawHitPoints(hitDie) {
  const dieMap = {
    'd6': 6,
    'd8': 8,
    'd10': 10,
    'd12': 12
  };

  const dieNumber = dieMap[hitDie];
  if (!dieNumber) {
    throw new Error(`Unexpected hit_die format: ${hitDie}`);
  }

  // Average roll of the hit die
  return Math.floor(dieNumber / 2) + 1;
}

// Calculate hit points considering hit die, level, and constitution
function calculateHitPoints(hitDie, level, constitution) {
  const dieMap = {
    'd6': 6,
    'd8': 8,
    'd10': 10,
    'd12': 12
  };

  const dieNumber = dieMap[hitDie];
  if (!dieNumber) {
    throw new Error(`Unexpected hit_die format: ${hitDie}`);
  }

  // Average roll of the hit die
  const averageRoll = Math.floor(dieNumber / 2) + 1;
  const constitutionModifier = getModifier(constitution); // Dynamic constitution modifier
  
  // Calculate total hit points
  return (averageRoll + constitutionModifier) * level; // Base HP at 1st level, add HP per level
}

// Calculate modifier from a stat score
function getModifier(stat) {
  return Math.floor((stat - 10) / 2);
}

// Build the main embed displaying character info
function buildMainEmbed(classDetails, hitPoints, rawHitPoints, level, stats, rawStats, adjustmentInfo, raceName) {
  const statNames = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];

  return new EmbedBuilder()
    .setTitle(`${classDetails.name} (${raceName})`)
    .setColor(0XCE3E43)
    .setDescription(
      `**Hit Die**: ${hitDieMap[classDetails.name]}\n` +
      `**Hit Points (Level ${level})**: ${hitPoints}\n\n` +
      `**Stats**:\n` +
      statNames.map((name, index) => {
        const statValue = stats[index];
        const statModifier = getModifier(statValue);
        return `**${name}**: ${statValue} (${statModifier >= 0 ? `+${statModifier}` : statModifier})`;
      }).join('\n') + '\n\n' +
      `**Adjustments**:\n${adjustmentInfo}`
    );
}

// Build adjustment information string
function buildAdjustmentInfo(className, raceName) {
  const classAdjustments = classStatAdjustments[className] || {};
  const raceAdjustments = raceStatAdjustments[raceName] || {};
  const allAdjustments = { ...classAdjustments, ...raceAdjustments };

  const adjustmentStrings = Object.entries(allAdjustments).map(([stat, amount]) => {
    const statName = stat.charAt(0).toUpperCase() + stat.slice(1); // Capitalize stat names
    return `${statName}: +${amount}`;
  });

  return adjustmentStrings.length > 0 ? adjustmentStrings.join('\n') : 'None';
}

// Build the embed for proficiencies and saving throws
function buildProficienciesEmbed(classDetails) {
  const proficiencies = classDetails.proficiencies.map(proficiency => proficiency.name);
  const savingThrows = classDetails.saving_throws.map(save => `Saving Throw: ${save.name.toUpperCase()}`);

  const uniqueProficiencies = proficiencies.filter(proficiency => 
    !savingThrows.some(save => proficiency.toUpperCase() === save.toUpperCase())
  );

  const proficienciesText = uniqueProficiencies.length > 0
    ? `**Proficiencies:**\n${uniqueProficiencies.map(name => `• ${name}`).join('\n')}`
    : 'None';

  const savingThrowsText = savingThrows.length > 0
    ? `**Saving Throws:**\n${savingThrows.map(name => `• ${name}`).join('\n')}`
    : 'None';

  return new EmbedBuilder()
    .setTitle('Proficiencies & Saving Throws')
    .setColor(0XCE3E43)
    .setDescription(
      `${proficienciesText}\n\n${savingThrowsText}`
    );
}

// Build the embed for starting equipment
function buildEquipmentEmbed(classDetails) {
  return new EmbedBuilder()
    .setTitle('Starting Equipment')
    .setColor(0XCE3E43)
    .setDescription(
      classDetails.starting_equipment.length > 0
        ? classDetails.starting_equipment.map(eq => `• ${eq.quantity}x ${eq.equipment.name}`).join('\n')
        : 'None'
    );
}

// Build the embed for proficiency choices
function buildProficiencyChoicesEmbed(classDetails) {
  return new EmbedBuilder()
    .setTitle('Proficiency Choices')
    .setColor(0XCE3E43)
    .setDescription(
      classDetails.proficiency_choices.length > 0
        ? classDetails.proficiency_choices.map(choice => {
            return `• ${choice.desc} (Choose ${choice.choose})`;
          }).join('\n\n')
        : 'None'
    );
}

// Build the embed for starting equipment options
function buildStartingEquipmentOptionsEmbed(classDetails) {
  return new EmbedBuilder()
    .setTitle('Starting Equipment Options')
    .setColor(0XCE3E43)
    .setDescription(
      classDetails.starting_equipment_options.length > 0
        ? classDetails.starting_equipment_options.map(option => 
            `• ${option.desc} (Choose ${option.choose})`
          ).join('\n\n')
        : 'None'
    );
}
