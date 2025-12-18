import express, { Router } from "express";
import { getProjects } from "../../controllers/shared/get/getProjects";
import { authenticate } from "../../middlewares/auth.middleware";
const sharedRoutes: Router = express.Router();

sharedRoutes.get("/get-projects", authenticate, getProjects);

export default sharedRoutes;
