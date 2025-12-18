import { Request, Response } from "express";
import { Types } from "mongoose";
import Chats from "../../../models/messages/chats.model";
import { Developer } from "../../../models/developers/dev.model";
import {
  extractDevIdFromConversationId,
  buildDeveloperDetailsPipeline,
} from "../../../utils/chat.util";

/**
 * Get all connected developers for the authenticated client
 * Extracts developer IDs from chat conversations and fetches their details
 */
export const getConnectedDevs = async (req: Request, res: Response) => {
  try {
    // Get clientId from authenticated user (from cookie/token)
    const clientId = req.user?.id;

    if (!clientId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    // Pagination params
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Step 1: Fetch all chats for this client using aggregation
    const chatsPipeline = [
      {
        $match: {
          conversationId: { $regex: `^${clientId}_\\._|_\\._${clientId}$` },
        },
      },
      {
        $project: {
          conversationId: 1,
          _id: 0,
        },
      },
    ];

    const chats = await Chats.aggregate(chatsPipeline).exec();

    if (!chats || chats.length === 0) {
      return res.json({
        success: true,
        message: "Connected developers fetched successfully",
        data: {
          developers: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalCount: 0,
            limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      });
    }

    // Step 2: Extract unique developer IDs from conversationIds
    const devIdSet = new Set<string>();
    for (const chat of chats) {
      const devId = extractDevIdFromConversationId(chat.conversationId, clientId);
      if (devId) devIdSet.add(devId);
    }

    const devIds = Array.from(devIdSet);
    if (devIds.length === 0) {
      return res.json({
        success: true,
        message: "Connected developers fetched successfully",
        data: {
          developers: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalCount: 0,
            limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      });
    }

    // Convert string IDs to ObjectIds for MongoDB query
    const devObjectIds = devIds.map((id) => new Types.ObjectId(id));

    // Count total matching developers
    const totalCount = await Developer.countDocuments({ _id: { $in: devObjectIds } }).exec();
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 0;

    // Step 3: Fetch developer details with pagination and exclude sensitive fields
    // We avoid returning sensitive fields: password, keys, isVerified, instantProjectsEnabled
    const developers = await Developer.find({ _id: { $in: devObjectIds } })
      .select('-password -keys -isVerified -instantProjectsEnabled -__v')
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return res.json({
      success: true,
      message: "Connected developers fetched successfully",
      data: {
        developers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("getConnectedDevs error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
