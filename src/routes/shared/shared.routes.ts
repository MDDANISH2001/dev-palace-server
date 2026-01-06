import { Router } from "express";
import getShared from "./get.routes";
import putShared from "./put.routes";

const sharedRoutes: Router = Router();

sharedRoutes.use("/", getShared);
sharedRoutes.use("/", putShared);

export default sharedRoutes;
