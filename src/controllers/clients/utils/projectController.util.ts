import { Types } from "mongoose";
import { Developer } from "../../../models/developers/dev.model";
import { ProjectType } from "../../../types/project.types";

/**
 * Build a notification payload for a project
 */
export const buildProjectNotification = (
  project: any,
  extra?: { reason?: string }
) => {
  return {
    id: project._id?.toString() || new Types.ObjectId().toString(),
    type: "project_posted",
    title: `New project: ${project.title}`,
    message:
      extra?.reason ||
      `A project was posted (${project.projectType} / ${project.urgencyLevel})`,
    data: {
      projectId: project._id?.toString(),
      projectType: project.projectType,
      urgencyLevel: project.urgencyLevel,
    },
  };
};

/**
 * Find developers matching the project's requirements using an aggregation pipeline.
 * - If skillsRequired provided, match developers with at least one overlapping skill.
 * - If projectType is 'instant' filter developers with instantProjectsEnabled=true.
 * - If urgencyLevel is 'high' prefer developers with availibility === 'available'.
 * Returns array of developer ids (strings).
 */
export const findMatchingDevelopers = async (project: ProjectType) => {
  const pipeline: any[] = [];

  // Match stage base
  const match: any = {};

  // If skills are provided, we want devs that have at least one of those skills
  if (project.skillsRequired && project.skillsRequired.length > 0) {
    // Use $expr + $setIntersection to ensure at least one match
    match.$expr = {
      $gt: [
        { $size: { $setIntersection: ["$skills", project.skillsRequired] } },
        0,
      ],
    };
  }

  // If project is instant, filter devs with instantProjectsEnabled
  if (project.projectType === "instant") {
    match.instantProjectsEnabled = true;
  }

  // For high urgency prefer available devs - we'll capture preference by sorting
  if (Object.keys(match).length > 0) pipeline.push({ $match: match });

  // Add field to score availability so we can sort preferred devs first
  pipeline.push({
    $addFields: {
      _availabilityScore: {
        $switch: {
          branches: [
            { case: { $eq: ["$availibility", "available"] }, then: 2 },
            { case: { $eq: ["$availibility", "busy"] }, then: 1 },
          ],
          default: 0,
        },
      },
    },
  });

  // If urgency is high, sort by availabilityScore desc, experience desc
  if (project.urgencyLevel === "high") {
    pipeline.push({ $sort: { _availabilityScore: -1, experience: -1 } });
  } else {
    // otherwise sort by experience desc
    pipeline.push({ $sort: { experience: -1 } });
  }

  // Limit how many developers we will suggest to avoid huge lists (tunable)
  pipeline.push({ $limit: 50 });

  // Project only id
  pipeline.push({ $project: { _id: 1 } });

  const docs = await Developer.aggregate(pipeline).exec();
  return docs.map((d: any) => d._id.toString());
};

export default {
  buildProjectNotification,
  findMatchingDevelopers,
};
