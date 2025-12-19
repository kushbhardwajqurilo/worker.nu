const mongoose = require("mongoose");
// const workerReminderSchema = new mongoose.Schema({
//   title: { type: String, required: [true, "title required"] },
//   date_to_show: { type: Date, require: [true, "reminder date required"] },
//   description: {
//     type: String,
//     required: [true, "description required"],
//   },
// });

const projectRemiderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title missing"],
  },
  date: {
    type: Date,
    required: [true, "remider date missing"],
  },
  description: {
    type: String,
    required: [true, "description required"],
  },
  project: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: [true],
      ref: "project",
    },
  ],
  notified: {
    type: Boolean,
    default: false,
  },
});

const notificationSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true],
    ref: "worker",
  },
  title: {
    type: String,
    require: [true],
  },
  message: {
    type: String,
    required: [true],
  },
  type: {
    type: String,
    required: [true],
  },
});
const ProjectReminder = mongoose.model(
  "project_reminder",
  projectRemiderSchema
);
const Notification = mongoose.model("notification", notificationSchema);
module.exports = { ProjectReminder, Notification };
