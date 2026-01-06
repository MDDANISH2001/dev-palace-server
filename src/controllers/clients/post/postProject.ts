import { Request, Response } from "express";
import { Project } from "../../../models/project.model";
import { SocketManager } from "../../../socket/SocketManager";
import {
  buildProjectNotification,
  findMatchingDevelopers,
} from "../utils/projectController.util";

/**
 * Create a new project and notify developers in real-time.
 * Uses aggregation for developer matching to keep calculations in DB.
 */
export const postProject = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.id;

    if (!clientId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const payload = req.body;

    // Basic required validations
    if (!payload.title || !payload.description || !payload.projectType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Create the project
    const project = await Project.create({ ...payload, clientId: clientId });

    // Find matching developers using aggregation (efficient DB-side calculation)
    const matchedDeveloperIds = await findMatchingDevelopers(project as any);

    // Build notification payload
    const notification = buildProjectNotification(project, {
      reason: "New project posted",
    });

    // Send notifications via SocketManager
    try {
      const socketManager = SocketManager.getInstance();
      const notificationHandler = socketManager.getNotificationHandler();

      // Broadcast to all developers (room)
      notificationHandler.sendNotificationToUserType("developer", notification);

      // Also emit notification types so subscribers can filter
      // projectType based
      notificationHandler.sendNotificationToType(
        project.projectType,
        notification as any
      );

      // urgency level specific
      if (project.urgencyLevel) {
        notificationHandler.sendNotificationToType(
          `urgency:${project.urgencyLevel}`,
          notification as any
        );
      }

      // Send direct notifications to matched developers (if any)
      for (const devId of matchedDeveloperIds) {
        notificationHandler.sendNotificationToUser(devId, {
          ...notification,
          message: `A project matching your skills was posted: ${project.title}`,
        });
      }
    } catch (err) {
      // Socket errors should not block API success
      console.warn("Socket notification failed:", (err as Error).message);
    }

    return res.status(201).json({
      success: true,
      data: project,
      matchedDeveloperCount: matchedDeveloperIds.length,
    });
  } catch (error: any) {
    console.error("postProject error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
