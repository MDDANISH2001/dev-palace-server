import { Router } from "express";
import authRoutes from "./authRoutes";
import clientRoutes from "./clients/client.routes";
// import developerRoutes from "./developers/developer.routes";
import sharedRoutes from "./shared/get.routes";

const router = Router();

// Mount all route modules
router.use("/auth", authRoutes);           // /api/auth/*
router.use("/clients", clientRoutes);      // /api/clients/*
// router.use("/developers", developerRoutes);// /api/developers/*
router.use("/common", sharedRoutes);       // /api/common/*

export default router;
