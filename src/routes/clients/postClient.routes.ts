import { Router } from "express";
import { postProject } from "../../controllers/clients/post/postProject";
import { authenticateClient } from "../../middlewares/auth.middleware";
const postClient = Router();

// Mount all route modules
postClient.use("/post-project", authenticateClient, postProject);      // /api/clients/*

export default postClient;
