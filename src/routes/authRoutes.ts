import express, { Router } from "express";
import { userAuth } from "../controllers/userAuth";
import { authenticate } from "../middlewares/auth.middleware";

const apiRoutes: Router = express.Router();

// Public routes (no authentication required)
apiRoutes.post("/client-register", userAuth.clientRegister);
apiRoutes.post("/client-login", userAuth.clientLogin);
apiRoutes.post("/dev-register", userAuth.devRegister);
apiRoutes.post("/dev-login", userAuth.devLogin);
// apiRoutes.get("/verify-email", userAuth.verifyEmail);

// Protected routes (authentication required)
apiRoutes.get("/verify", authenticate, userAuth.verifyAuth);
apiRoutes.post("/logout", authenticate, userAuth.logout);

export default apiRoutes;