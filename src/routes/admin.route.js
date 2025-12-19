const {
  getHolidayRequest,
  approveLeaveRequest,
  getSicknessRequest,
  setProjectReminder,
} = require("../controller/admin/admin.controller");
const {
  authMiddeware,
  accessMiddleware,
} = require("../middleware/authMiddleware");

const adminRouter = require("express").Router();
adminRouter.get(
  "/holidays",
  authMiddeware,
  accessMiddleware("admin"),
  getHolidayRequest
);

adminRouter.get(
  "/sickness",
  authMiddeware,
  accessMiddleware("admin"),
  getSicknessRequest
);
adminRouter.post(
  "/approve",
  authMiddeware,
  accessMiddleware("admin"),
  approveLeaveRequest
);

// =================== Reminder ===================
adminRouter.post("/project-reminder", setProjectReminder);
module.exports = adminRouter;
