const fs = require("fs");
const { generateWelcomeImage } = require("joy-wellcome-api");

module.exports.config = {
  name: "join",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "JOY",
  description: "Welcome Member & Bot Join Notification"
};

module.exports.run = async function ({ api, event }) {
  try {
    if (!event.logMessageData?.addedParticipants) return;

    // BOT JOIN MESSAGE
    if (
      event.logMessageData.addedParticipants.some(
        user => user.userFbId == api.getCurrentUserID()
      )
    ) {
      try {
        await api.changeNickname(
          `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "Bot"}`,
          event.threadID,
          api.getCurrentUserID()
        );
      } catch (e) {}

      return api.sendMessage(
        `✅ BOT CONNECTED SUCCESSFULLY!

🤖 Bot Name: ${global.config.BOTNAME || "Bot"}
📌 Prefix: ${global.config.PREFIX}

Thank you for adding me to your group ❤️

Type ${global.config.PREFIX}help to see all commands.`,
        event.threadID
      );
    }

    const threadInfo = await api.getThreadInfo(event.threadID);

    for (const user of event.logMessageData.addedParticipants) {
      try {
        const buffer = await generateWelcomeImage({
          adderId: event.author,
          adderName: "Group Member",
          userId: user.userFbId,
          userName: user.fullName,
          group: threadInfo.threadName || "This Group",
          members: threadInfo.participantIDs.length
        });

        const filePath = `cache/welcome_${user.userFbId}.png`;

        fs.writeFileSync(filePath, buffer);

        api.sendMessage(
          {
            body: `🎉 Welcome ${user.fullName}

📌 Group: ${threadInfo.threadName}
👥 Members: ${threadInfo.participantIDs.length}

Enjoy your stay ❤️`,
            mentions: [
              {
                tag: user.fullName,
                id: user.userFbId
              }
            ],
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        );
      } catch (err) {
        console.log("WELCOME ERROR:", err);
      }
    }
  } catch (err) {
    console.log("JOIN ERROR:", err);
  }
};
