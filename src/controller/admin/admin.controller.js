const { default: mongoose } = require("mongoose");
const cron = require("node-cron");
const {
  catchAsync,
  AppError,
  sendSuccess,
} = require("../../utils/errorHandler");
const { holidayModel, sicknessModel } = require("../../models/leavesModel");
const adminModel = require("../../models/authmodel/adminModel");
const { workerModel } = require("../../models/workerModel");
const {
  ProjectReminder,
  Notification,
} = require("../../models/reminder.model");
const projectMode = require("../../models/projectMode");

//get leaves for admin
exports.getHolidayRequest = catchAsync(async (req, res, next) => {
  const { admin_id } = req;
  if (!mongoose.Types.ObjectId.isValid(admin_id)) {
    return next("invalid admin credentials");
  }

  const admin = await adminModel.findById(admin_id);
  if (!admin) {
    return next(new AppError("invalid admin", 400));
  }
  const result = await holidayModel.find({ status: "pending" });
  if (!result) {
    return next(new AppError("now holiday request found.", 400));
  }
  return sendSuccess(res, "holiday request found", result, 200, true);
});

// get sick leave request
exports.getSicknessRequest = catchAsync(async (req, res, next) => {
  const { admin_id } = req;
  if (!mongoose.Types.ObjectId.isValid(admin_id)) {
    return next("invalid admin credentials");
  }

  const admin = await adminModel.findById(admin_id);
  if (!admin) {
    return next(new AppError("invalid admin", 400));
  }
  const result = await sicknessModel.find({ status: "pending" });
  if (!result) {
    return next(new AppError("sickness request found.", 400));
  }
  return sendSuccess(res, "sickeness requests found", result, 200, true);
});

// approve holiday request

exports.approveLeaveRequest = catchAsync(async (req, res, next) => {
  const { admin_id } = req;
  const { l_id, leave, w_id } = req.query;
  if (
    !mongoose.Types.ObjectId.isValid(admin_id) ||
    !mongoose.Types.ObjectId.isValid(l_id) ||
    !mongoose.Types.ObjectId.isValid(w_id)
  ) {
    return next(new AppError("invalid credentials", 400));
  }
  if (!leave) {
    return next(new AppError("leave type missing", 400));
  }
  //   check valid worker
  const worker = await workerModel.findById(w_id);
  if (!worker) {
    return next(new AppError("Invalid Worker", 400));
  }
  if (worker.isActive === false || worker.isDelete) {
    return next(new AppError("worker not active", 400));
  }

  //   check  for leave
  if (leave === "sickness") {
    const sickness = await sicknessModel.findById(l_id);
    if (!sickness) {
      return next(new AppError("sickness request not found", 400));
    }
    if (sickness.status === "approve") {
      return next(new AppError("sick leave request already aprroved", 400));
    }
    sickness.status = "approve";
    sickness.approvedAt = Date.now();
    await sickness.save();

    // days deduction
    worker.worker_holiday.remaining_sickness =
      worker.worker_holiday.remaining_sickness - 1;

    worker.worker_holiday.sickness_taken =
      worker.worker_holiday.sickness_taken + 1;
    await worker.save();
    return sendSuccess(res, "sick leave request approved", {}, 201, true);
  } else if (leave === "holiday") {
    const holidays = await holidayModel.findById(l_id);
    if (!holidays) {
      return next(new AppError("holidat request not found", 400));
    }
    if (holidays.status === "approve") {
      return next(new AppError("holiday request already aprroved", 400));
    }
    holidays.status = "approve";
    holidays.approvedAt = Date.now();
    await holidays.save();

    // days deduction
    worker.worker_holiday.remaining_holidays =
      worker.worker_holiday.remaining_holidays - 1;

    worker.worker_holiday.holidays_taken =
      worker.worker_holiday.holidays_taken + 1;

    await worker.save();
    return sendSuccess(res, "holiday request approved", {}, 201, true);
  } else {
    return next(new AppError("Invalid Request Type", 400));
  }
});

// <-------------- REMINDERS ----------->
exports.setProjectReminder = catchAsync(async (req, res, next) => {
  // const { admin_id } = req;
  // if (!admin_id || admin_id == undefined) {
  //   return next(new AppError("admin credentials missing", 400));
  // }
  // if (!mongoose.Types.ObjectId.isValid(admin_id)) {
  //   return next(new AppError("invalid admin credential", 400));
  // }
  const requiredField = ["title", "date", "description", "project"];
  for (fields of requiredField) {
    if (!req.body[fields] || req.body[fields].toString().trim().length === 0) {
      return next(new AppError(`${fields} missing`, 400));
    }
  }
  const reminder = {
    title: req.body.title,
    date: req.body.date,
    description: req.body.description,
    project: req.body.project,
  };
  const setReminder = await ProjectReminder.create(reminder);
  if (!setReminder) {
    return next(new AppError("unable to set reminder"));
  }
  return sendSuccess(res, "Reminder set", {}, 200, true);
});

// cron.schedule("0 9 * * *", async () => {
//   const today = new Date().toISOString().split("T")[0];

//   const reminders = await ProjectReminder.find({
//     notified: false,
//   });

//   for (const reminder of reminders) {
//     // ✅ reminder ki date ko bhi YYYY-MM-DD me lao
//     const reminderDate = new Date(reminder.date).toISOString().split("T")[0];

//     // 🔴 agar aaj ki date se match nahi hui → skip
//     if (reminderDate !== today) {
//       console.log("daye not match", reminder.date, today);
//     }

//     // ✅ yahan aayega matlab DATE MATCH ho chuki hai
//     console.log("TODAY REMINDER:", reminder.title);

//     const projects = await projectMode
//       .find({ _id: { $in: reminder.project } })
//       .select("project_workers.workers");

//     const workerSet = new Set();

//     for (const project of projects) {
//       for (const workerId of project.project_workers.workers) {
//         workerSet.add(workerId.toString());
//       }
//     }

//     for (const workerId of workerSet) {
//       await Notification.create({
//         workerId: workerId,
//         title: reminder.title,
//         message: reminder.description,
//         type: "project_reminder sssss",
//       });
//     }

//     reminder.notified = true;
//     await reminder.save();
//   }
// });
