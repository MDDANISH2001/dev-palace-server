export interface MatchRequest {
    projectId: string;
    notifiedDevelopers: string[];
    acceptedDevelopers: string[];
    assignedDeveloper?: string;
    status: "pending" | "in-review" | "assigned" | "expired";
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
};