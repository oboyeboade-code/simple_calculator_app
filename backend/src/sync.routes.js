import { Router } from 'express';
import { SyncController } from './sync.controller.js';
import { asyncHandler } from "./async-handler.js";

const router = Router();

router.post(
  "/enable-sync",
  asyncHandler(SyncController.enableSync)
);

router.post(
  "/calculation",
  asyncHandler(SyncController.addCalculation)
);

router.get(
  "/history",
  asyncHandler(SyncController.getHistory)
);

router.delete(
  "/history",
  asyncHandler(SyncController.clearHistory)
);

router.post(
  "/logout",
  asyncHandler(SyncController.logout)
);

export default router;