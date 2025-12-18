import express, { Router } from "express";
import { authenticateClient } from "../../middlewares/auth.middleware";
import { getProfile } from "../../controllers/clients/get/getProfile";
import { getConnectedDevs } from "../../controllers/clients/get/getConnectedDevs";
const getClient: Router = express.Router();

getClient.get("/get-profile", authenticateClient, getProfile);
getClient.get("/connected-devs", authenticateClient, getConnectedDevs);

export default getClient;
