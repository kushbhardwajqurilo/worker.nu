const { default: mongoose } = require("mongoose");

const {
  catchAsync,
  sendSuccess,
  AppError,
} = require("../../utils/errorHandler");
const { workerModel } = require("../../models/workerModel");
const { holidayModel, sicknessModel } = require("../../models/leavesModel");

// <---------- Add Worker Start Here ------------>

exports.addWorker = catchAsync(async (req, res, next) => {
  // Validate body
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError("Worker details missing", 400));
  }

  // Check if phone number exists
  const phone = req.body?.worker_personal_details?.phone;
  if (!phone) {
    return next(new AppError("Worker phone number required", 400));
  }

  const isWorker = await workerModel.findOne({
    "worker_personal_details.phone": phone,
  });

  if (isWorker) {
    return next(new AppError("Worker phone already registered", 400));
  }

  const isHolidays = await HolidaySickness.find({});
  // Create worker
  const insert = await workerModel.create(req.body);
  if (!insert) {
    return next(new AppError("Failed to add worker", 400));
  }
  console.log("holi", isHolidays[0]);
  const leaves = isHolidays[0];

  if (isHolidays) {
    insert.worker_holiday.holidays_per_month = leaves.holiday.monthly_limit;
    insert.worker_holiday.remaining_holidays = leaves.holiday.monthly_limit;
    insert.worker_holiday.remaining_sickness = leaves.sickness.monthly_limit;
    insert.worker_holiday.sickness_per_month = leaves.sickness.monthly_limit;
  }
  insert.dashboardUrl = `https://worker-nu-rust.vercel.app/worker?w_id=${insert._id}`;

  // Admin link visible for only 10 minutes
  insert.urlVisibleToAdmin = true;
  insert.urlAdminExpireAt = Date.now() + 24 * 60 * 60 * 1000; //for 24 hour

  await insert.save();

  return sendSuccess(res, "Worker added successfully", insert, 200, true);
});

// <---------- Add Worker End Here ------------>

// <---------- Get Single Worker ------------->

exports.getSingleWorkerController = catchAsync(async (req, res, next) => {
  const { worker_id } = req.query;
  if (!worker_id || worker_id.toString().trim().length === 0) {
    return next(new AppError("worker credentials missing", 400));
  }

  const isWorker = await workerModel.findById(worker_id);
  if (!isWorker) {
    return next(new AppError("worker not found", 400));
  }

  // worker ke liye link always active
  return sendSuccess(res, "worker found", isWorker, 200, true);
});

// <---------- Get Single Worker End ------------->

// <---------- Update worker Start ---------------->

exports.updateWorkerController = catchAsync(async (req, res, next) => {
  const { w_id } = req.query;
  const { data } = req.body;
  if (!w_id) {
    return next(new AppError("worker credential missing", 400));
  }
  if (!data || Object.keys(data).length === 0) {
    return next(new AppError("worker details missing", 400));
  }

  // Get current worker
  const worker = await workerModel.findById(w_id);
  if (!worker) {
    return next(new AppError("worker not found", 400));
  }
  // Check if phone already exists on another worker
  if (data.worker_personal_details?.phone) {
    const isPhoneExist = await workerModel.findOne({
      "worker_personal_details.phone": data.worker_personal_details.phone,
      _id: { $ne: w_id },
    });
    if (isPhoneExist) {
      return next(new AppError("Phone Number Already In Use", 400));
    }
  }
  // Update worker properly
  const updatedWorker = await workerModel.findByIdAndUpdate(
    w_id,
    { $set: data },
    { new: true, runValidators: true }
  );
  return sendSuccess(res, "worker updated", updatedWorker, 200, true);
});

// <---------- Update worker End ---------------->

// <---------- delete worker  --------------->
// soft delete, data will kepp in database
exports.deleteWorkerController = catchAsync(async (req, res, next) => {
  const { w } = req.query;
  if (!w || w.length === 0) {
    return next(new AppError("Worker Identification Missing", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(w)) {
    return next(new AppError("worker id must ObjectId", 400));
  }
  // check woker exist or not
  const isWorkerExist = await workerModel.findByIdAndUpdate(w, {
    $set: { isDelete: true },
  });
  if (isWorkerExist === null || isWorkerExist.length === 0) {
    return next(new AppError("Worker Not Found", 400));
  }
  return sendSuccess(res, "worker delete sucessfully", {}, 201, true);
});

//  <--------- delete worker end ------------------>

// <------- multiple delete workers ---------------->

// <-------- multile delete worker end ------------->

exports.multipleDeleteWorkerController = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError("workers credential missing", 400));
  }
  const { w_id } = req.body;
  if (!w_id || w_id.length === 0) {
    return next(new AppError("workers credental missing", 400));
  }
  for (let id of w_id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid Worker Credentials "));
    }
  }
  const del = await workerModel.updateMany(
    { _id: { $in: w_id } },
    { $set: { isDelete: true, isActive: false } }
  );
  if (!del || del.length === 0) {
    return next(new AppError("failed to delete,  try again"));
  }
  return sendSuccess(res, "workers deleted", {}, 201, true);
});

// <-------- get all worker list except deleted workers ------------->

exports.getAllWorkerController = catchAsync(async (req, res, next) => {
  const workerList = await workerModel.find({ isDelete: { $ne: true } });
  if (!workerList || workerList.length === 0) {
    return next(new AppError("No worker found", 400));
  }

  // Modify admin visibility
  const updatedList = workerList.map((worker) => {
    if (worker.urlAdminExpireAt && Date.now() > worker.urlAdminExpireAt) {
      worker.urlVisibleToAdmin = false;
    }

    return {
      ...worker._doc,
      dashboardUrl: worker.urlVisibleToAdmin ? worker.dashboardUrl : null,
    };
  });

  return sendSuccess(res, "data found", updatedList, 200, true);
});

// <---------- get all worker list end here -------------->

// <---------- make inactive worker ------------>

exports.makeInActiveWorker = catchAsync(async (req, res, next) => {
  const { w_id } = req.query;
  if (!w_id || w_id.length === 0) {
    return next(new AppError("worker id required", 400));
  }
  if (!mongoose.Types.ObjectId.isValid(w_id)) {
    return next(new AppError("invaild worker id"));
  }
  const isWorkerExist = await workerModel.findByIdAndUpdate(w_id, {
    $set: { isActive: false },
  });
  if (!isWorkerExist || isWorkerExist.length === 0) {
    return next(new AppError("worker not found", 400));
  }
  return sendSuccess(res, "worker InActive", {}, 201, true);
});

// <---------- make inactive worker end------------>

// <----------- search  worker ------------>

exports.searchWorkerController = catchAsync(async (req, res, next) => {
  const { q = "" } = req.query;

  // escape special characters to avoid regex injection
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const query = {
    $or: [
      {
        "worker_personal_details.firstName": {
          $regex: `^${safeQ}`,
          $options: "i",
        },
      },
      {
        "worker_personal_details.lastName": {
          $regex: `^${safeQ}`,
          $options: "i",
        },
      },
      {
        "worker_personal_details.phone": {
          $regex: `^${safeQ}`,
          $options: "i",
        },
      },
      {
        worker_position: {
          $regex: `^${safeQ}`,
          $options: "i",
        },
      },
    ],
  };

  const search = await workerModel.find(query);
  if (search.length === 0 || !search) {
    return next(new AppError("no search found", 400));
  }
  return sendSuccess(res, "Workers fetched successfully", search, 200, true);
});

// <----------- search worker end ------------>

// <---------- Holiday / Sickness ------------>
exports.requestHoliday = catchAsync(async (req, res, next) => {
  const { w_id } = req.query;

  // ✅ w_id validation
  if (!w_id) {
    return next(new AppError("w_id missing", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(w_id)) {
    return next(new AppError("Invalid w_id", 400));
  }

  const { range, reason } = req.body;

  // ✅ body validation
  if (!range || !range.startDate || !range.endDate || !reason) {
    return next(
      new AppError("startDate, endDate and reason are required", 400)
    );
  }

  const startDate = new Date(range.startDate);
  const endDate = new Date(range.endDate);

  if (startDate > endDate) {
    return next(new AppError("startDate cannot be greater than endDate", 400));
  }

  // ✅ worker check
  const isWorker = await workerModel.findById(w_id);
  if (!isWorker) {
    return next(new AppError("Worker not found", 400));
  }

  if (isWorker.isDelete || !isWorker.isActive) {
    return next(new AppError("Worker not active", 400));
  }

  // ✅ total days calculation (inclusive)
  const totalDays =
    Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const payload = {
    workerId: w_id,
    duration: {
      startDate,
      endDate,
      totalDays,
    },
    reason: reason,
  };

  const leaveRequest = await holidayModel.create(payload);

  return sendSuccess(
    res,
    "Leave request submitted successfully",
    leaveRequest,
    201,
    true
  );
});

exports.requestSickness = catchAsync(async (req, res, next) => {
  const { w_id } = req.query;

  // ✅ w_id validation
  if (!w_id) {
    return next(new AppError("w_id missing", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(w_id)) {
    return next(new AppError("Invalid w_id", 400));
  }

  const { range, discription } = req.body;

  // ✅ body validation
  if (!range || !range.startDate || !range.endDate || !discription) {
    return next(
      new AppError("startDate, endDate and discription are required", 400)
    );
  }

  const startDate = new Date(range.startDate);
  const endDate = new Date(range.endDate);

  if (startDate > endDate) {
    return next(new AppError("startDate cannot be greater than endDate", 400));
  }

  // ✅ worker check
  const isWorker = await workerModel.findById(w_id);
  if (!isWorker) {
    return next(new AppError("Worker not found", 400));
  }

  if (isWorker.isDelete || !isWorker.isActive) {
    return next(new AppError("Worker not active", 400));
  }

  // ✅ total days calculation (inclusive)
  const totalDays =
    Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const payload = {
    workerId: w_id,
    duration: {
      startDate,
      endDate,
      totalDays,
    },
    discription,
  };

  const leaveRequest = await sicknessModel.create(payload);

  return sendSuccess(
    res,
    "Leave request submitted successfully",
    leaveRequest,
    201,
    true
  );
});

// get holiday for worker
exports.getHolidays = catchAsync(async (req, res, next) => {
  const { w_id } = req.query;
  if (!w_id) {
    return next(new AppError("w_id missing", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(w_id)) {
    return next(new AppError("Invalid w_id", 400));
  }

  const result = await holidayModel.find({ workerId: w_id });
  if (!result) {
    return next(new AppError("no holidays found", 400));
  }
  return sendSuccess(res, "success", result, 200, true);
});
exports.getSickness = catchAsync(async (req, res, next) => {
  const { w_id } = req.query;
  if (!w_id) {
    return next(new AppError("w_id missing", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(w_id)) {
    return next(new AppError("Invalid w_id", 400));
  }

  const result = await sicknessModel.find({ workerId: w_id });
  if (!result) {
    return next(new AppError("no holidays found", 400));
  }
  return sendSuccess(res, "success", result, 200, true);
});
// <---------- Holiday / Sickness  End------------>
