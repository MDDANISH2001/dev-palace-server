import { Types } from "mongoose";

/**
 * Extract developer ID from conversationId
 * Format: clientId_._devId
 */
export const extractDevIdFromConversationId = (
  conversationId: string,
  clientId: string
): string | null => {
  const parts = conversationId.split("_._");
  if (parts.length !== 2) return null;

  // Check if clientId matches the first part
  if (parts[0] === clientId) {
    return parts[1]; // Return devId
  }

  // Check if clientId matches the second part (reversed format)
  if (parts[1] === clientId) {
    return parts[0]; // Return devId
  }

  return null;
};

/**
 * Build aggregation pipeline to fetch developer details
 * Returns: { devId, name, profileImg, skills, availability }
 */
export const buildDeveloperDetailsPipeline = (devIds: Types.ObjectId[]) => {
  return [
    {
      $match: {
        _id: { $in: devIds },
      },
    },
    {
      $project: {
        devId: { $toString: "$_id" },
        name: 1,
        profileImg: 1,
        skills: 1,
        availibility: 1, // Note: field is "availibility" in schema
        _id: 0,
      },
    },
  ];
};

export default {
  extractDevIdFromConversationId,
  buildDeveloperDetailsPipeline,
};
