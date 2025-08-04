const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll one or more dice with modifiers.')
    .addStringOption(option =>
      option
        .setName('dice')
        .setDescription('Specify the dice to roll (e.g., 2d6+3 or d20).')
        .setRequired(true)
    ),
  async execute(interaction) {
    const diceString = interaction.options.getString('dice');

    // Prepend '1' to diceString if it doesn't start with a number
    const formattedDiceString = /^\d/.test(diceString) ? diceString : '1' + diceString;

    const { total, rolls, rollsTotal } = rollDiceWithModifier(formattedDiceString);

    let responseText = `You rolled ${formattedDiceString}:\nTotal with modifier: ${total}`;

    if (rolls.length > 0) {
      responseText += '\nIndividual Rolls: ' + rolls.join(', ') + `\nTotal without modifier: ${rollsTotal}`;
    }

    await interaction.reply(`\`\`\`${responseText}\`\`\``);
  },
};

// Helper function to roll the dice with modifiers
function rollDiceWithModifier(diceString) {
  const regex = /(\d*)d(\d+)([+-]\d+)?/g;
  const matches = Array.from(diceString.matchAll(regex));

  let total = 0;
  const rolls = [];
  let rollsTotal = 0;

  for (const match of matches) {
    const numDice = match[1] ? parseInt(match[1]) : 1;
    const diceSides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    let currentRollsTotal = 0;

    for (let i = 0; i < numDice; i++) {
      const rollResult = Math.floor(Math.random() * diceSides) + 1;
      rolls.push(rollResult);
      currentRollsTotal += rollResult;
      total += rollResult;
    }

    rollsTotal += currentRollsTotal;
    total += modifier;
  }

  return { total, rolls, rollsTotal };
}
