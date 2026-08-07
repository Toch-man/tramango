import { Router } from "express";
import { getPackages, bookPackage } from "../controller/package_controller.ts";

const router = Router();

router.get("/packages", getPackages);

router.post("/packages/:id/book", bookPackage);

export default router;
