import { Router } from "express";
import getClient from "./getClient.routes";
import postClient from "./postClient.routes";

const clientRoutes: Router = Router();

// Mount client sub-routers
// e.g. GET /api/clients/get-profile
clientRoutes.use("/", getClient);
// e.g. POST /api/clients/post-projects
clientRoutes.use("/", postClient);

export default clientRoutes;
