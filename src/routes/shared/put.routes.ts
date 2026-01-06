import express, { Router } from "express";
import { getProjects } from "../../controllers/shared/get/getProjects";
import { authenticate } from "../../middlewares/auth.middleware";
import { verifyEmail } from "../../controllers/shared/put/verifyEmail";
const putShared: Router = express.Router();

putShared.put("/verify-email", verifyEmail);

export default putShared;
