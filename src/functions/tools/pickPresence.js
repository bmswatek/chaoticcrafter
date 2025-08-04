const { ActivityType } = require("discord.js");

module.exports = (client) => {
  client.pickPresence = async () => {
    const options = [
      {
        type: ActivityType.Playing,
        text: "Monster Manual | /help",
        status: "online",
      },
      {
        type: ActivityType.Playing,
        text: "Player's Handbook | /help",
        status: "online",
      },
      {
        type: ActivityType.Playing,
        text: "Dungeon Master's Guide | /help",
        status: "online",
      },
    ];
    const option = Math.floor(Math.random() * options.length);

    client.user.setPresence({
      activities: [
        {
          name: options[option].text,
          type: options[option].type,
        },
      ],
      status: options[option].status,
    });
  };
};
