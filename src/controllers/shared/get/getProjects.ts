import { Request, Response } from "express";
import { Project } from "../../../models/project.model";
import { ApiResponse } from "../../../utils/apiResponse";

export const getProjects = async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    console.log(" request query:", req.query);
    console.log(" request params:", req.params);
    console.log(" request body:", req.body);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const myProjects = req.query.myProjects === "true";
    const status = req.query.status as string;
    const projectId = req.query.projectId as string;
    const clientId = req.user.id;

    if (projectId) {
      const project = await Project.findById(projectId).lean();
      if (!project) {
        return ApiResponse.error(res, "Project not found", 404);
      }
      return ApiResponse.success(res, "Project fetched successfully", {
        projects: [project],
      });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build match stage
    const matchStage: any = {};
    if (status) {
      matchStage.status = status;
    }
    if (myProjects) {
      matchStage.clientId = clientId;
    }

    // Aggregation pipeline
    const pipeline: any[] = [
      // Match stage - filter documents
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),

      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } },

      // Facet stage - get both paginated results and total count in one query
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          projects: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    // Execute aggregation
    const result = await Project.aggregate(pipeline);

    // Extract results
    const totalCount = result[0]?.metadata[0]?.totalCount || 0;
    const projects = result[0]?.projects || [];

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Send response
    return ApiResponse.success(res, "Projects fetched successfully", {
      projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return ApiResponse.error(
      res,
      "Failed to fetch projects",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
