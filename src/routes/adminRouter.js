const {
  addWorkerPositionController,
  getAllPostionController,
} = require("../controller/admin/admin.controller");
const {
  authMiddeware,
  accessMiddleware,
} = require("../middleware/authMiddleware");
const adminRouter = require("express").Router();
adminRouter.post("/add-position", addWorkerPositionController);
adminRouter.get("/get-positions", getAllPostionController);
module.exports = adminRouter;
