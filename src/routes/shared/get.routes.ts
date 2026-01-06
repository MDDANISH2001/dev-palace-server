import express, { Router } from "express";
import { getProjects } from "../../controllers/shared/get/getProjects";
import { authenticate } from "../../middlewares/auth.middleware";
const getShared: Router = express.Router();

getShared.get("/get-projects", authenticate, getProjects);

export default getShared;
