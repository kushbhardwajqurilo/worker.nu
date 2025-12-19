const cron = require("node-cron");

const {
  ProjectReminder,
  Notification,
} = require("../../models/reminder.model");
const projectMode = require("../../models/projectMode");
const { getIo } = require("../../../socket/scoket");

cron.schedule(
  "* * * * *",
  async () => {
    console.log("⏰ Reminder cron running");

    let io;
    try {
      io = getIo(); // ✅ FIX HERE
    } catch (err) {
      console.log("⚠️ Socket not initialized yet");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const reminders = await ProjectReminder.find({ notified: false });

    for (const reminder of reminders) {
      const reminderDate = new Date(reminder.date).toISOString().split("T")[0];

      if (reminderDate !== today) continue;

      const projects = await projectMode
        .find({ _id: { $in: reminder.project } })
        .select("project_workers.workers");

      const workerSet = new Set();

      for (const project of projects) {
        for (const workerId of project.project_workers.workers) {
          workerSet.add(workerId.toString());
        }
      }

      for (const workerId of workerSet) {
        const notification = await Notification.create({
          workerId,
          title: reminder.title,
          message: reminder.description,
          type: "project_reminder",
        });

        console.log("📩 Notification created:", notification._id);

        // 🔥 REAL-TIME PUSH
        io.to(workerId.toString()).emit("notification", notification);
      }

      reminder.notified = true;
      await reminder.save();
    }
  },
  { timezone: "Asia/Kolkata" }
);
