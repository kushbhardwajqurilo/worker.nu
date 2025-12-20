const mongoose = require("mongoose");
const ReminderSchema = new mongoose.Schema({
  workerId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "worker",
      default: null,
    },
  ],
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "auth",
    default: null,
  },
  title: {
    type: String,
    required: [true, "title required"],
  },
  date: {
    type: Date,
    required: [true, "date required"],
  },
  reminderFor: {
    type: String,
    enum: {
      values: ["worker", "manager", "both"],
      message: "Reminder should be for worker, manager, or both",
    },
  },
  note: {
    type: String,
    required: [true, "note required"],
  },
  isSent: {
    type: Boolean,
    default: false,
  },
  project: [{ type: mongoose.Schema.Types.ObjectId, default: null }],
});

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "user id required"],
  },
  message: {
    type: String,
    required: [true, "message required"],
  },
  title: {
    type: String,
    required: [true, "title required"],
  },
});
const WorkerReminder = mongoose.model("reminder", ReminderSchema);
const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = { WorkerReminder, Notification };
