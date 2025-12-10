const { workerPositionModel } = require("../../models/workerModel");
const {
  catchAsync,
  AppError,
  sendSuccess,
} = require("../../utils/errorHandler");

// <------- add worker positon --------->
exports.addWorkerPositionController = catchAsync(async (req, res, next) => {
  if (!req.body || req.body.length === 0) {
    return next(new AppError("Position Credentials missing"));
  }
  const { worker_position } = req.body;
  if (!worker_position || worker_position.length === 0) {
    return next(AppError("position missing", 400));
  }
  const insert = await workerPositionModel.create({
    position: worker_position,
  });
  if (!insert) {
    return next(new AppError("failed to add position", 400));
  }
  return sendSuccess(res, "position added", {}, 200, true);
});
// <------- add worker positio end ---------->

// <------- get all worker position ------->

exports.getAllPostionController = catchAsync(async (req, res, next) => {
  const result = await workerPositionModel.find().select("--v");
  if (!result || result.length === 0) {
    return next(new AppError("faild to fetch try again later"));
  }
  return sendSuccess(res, "success", result, 200, true);
});

// <----- get all worker postion end -------->
