import { Request, Response } from "express";
import { Project } from "../../../models/project.model";
import { SocketManager } from "../../../socket/SocketManager";
import {
  buildProjectNotification,
  findMatchingDevelopers,
} from "../utils/projectController.util";

/**
 * Update an existing project and notify relevant parties if needed.
 */
export const putProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const updates = req.body;

    if (!projectId) {
      return res
        .status(400)
        .json({ success: false, message: "Project id is required" });
    }

    const previous = await Project.findById(projectId).lean();
    if (!previous)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const updated = await Project.findByIdAndUpdate(projectId, updates, {
      new: true,
    }).lean();

    if (!updated)
      return res
        .status(500)
        .json({ success: false, message: "Failed to update project" });

    // If important fields changed, recompute matching developers and notify
    const importantChanged =
      JSON.stringify(previous.skillsRequired || []) !==
        JSON.stringify(updated.skillsRequired || []) ||
      previous.projectType !== updated.projectType ||
      previous.urgencyLevel !== updated.urgencyLevel;

    try {
      const socketManager = SocketManager.getInstance();
      const notificationHandler = socketManager.getNotificationHandler();

      const notification = buildProjectNotification(updated, {
        reason: "Project updated",
      });

      // Broadcast update to developers in general
      notificationHandler.sendNotificationToUserType(
        "developer",
        notification as any
      );

      // If status changed and developer(s) were assigned, notify them directly
      if (
        updates.status &&
        updated.developerId &&
        Array.isArray(updated.developerId) &&
        updated.developerId.length > 0
      ) {
        for (const devId of updated.developerId) {
          notificationHandler.sendNotificationToUser(devId, {
            ...notification,
            type: "project_update",
            message: `Project ${updated.title} status changed to ${updated.status}`,
          });
        }
      }

      // If important fields changed, find matching developers again and notify
      if (importantChanged) {
        const matchedDeveloperIds = await findMatchingDevelopers(
          updated as any
        );

        // notify matched devs directly
        for (const devId of matchedDeveloperIds) {
          notificationHandler.sendNotificationToUser(devId, {
            ...notification,
            message: `Project updated and may match your skills: ${updated.title}`,
          });
        }
      }
    } catch (err) {
      console.warn("Socket notification failed:", (err as Error).message);
    }

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("putProject error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
