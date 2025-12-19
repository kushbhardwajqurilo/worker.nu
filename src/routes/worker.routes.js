const {
  addWorker,
  getSingleWorkerController,
  updateWorkerController,
  deleteWorkerController,
  getAllWorkerController,
  makeInActiveWorker,
  multipleDeleteWorkerController,
  searchWorkerController,
  requestHoliday,
  requestSickness,
  getHolidays,
  getSickness,
} = require("../controller/worker/worker.controller");
const {
  authMiddeware,
  accessMiddleware,
} = require("../middleware/authMiddleware");
const workerRouter = require("express").Router();
workerRouter.post(
  "/add-worker",

  addWorker
); // add worker route
workerRouter.put(
  "/update-worker",
  authMiddeware,
  accessMiddleware("admin"),
  updateWorkerController
); // update worker
workerRouter.get("/get-single-worker", getSingleWorkerController);
workerRouter.delete(
  "/delete-worker",
  authMiddeware,
  accessMiddleware("admin"),
  deleteWorkerController
); // delete worker
workerRouter.get(
  "/get-all-worker",
  authMiddeware,
  accessMiddleware("admin"),
  getAllWorkerController
);
workerRouter.patch(
  "/inactive-worker",
  authMiddeware,
  accessMiddleware("admin"),
  makeInActiveWorker
); // InActive worker
workerRouter.post(
  "/multiple-delete-worker",
  authMiddeware,
  accessMiddleware("admin"),
  multipleDeleteWorkerController
);
workerRouter.get(
  "/search-worker",
  authMiddeware,
  accessMiddleware("admin"),
  searchWorkerController
);

workerRouter.post("/request-holiday", requestHoliday);
workerRouter.post("/request-sickness", requestSickness);
workerRouter.get("/get-holiday", getHolidays);
workerRouter.get("/get-sickness", getSickness);
module.exports = workerRouter;
