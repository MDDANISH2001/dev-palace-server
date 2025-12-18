import { MediaType } from "./shared.types";

export interface BudgetType {
    min: number;
    max: number;
}

export interface ProjectType {
    title: string;
    description: string;
    clientId: string;
    projectType: "direct" | "listed" | "instant";
    skillsRequired?: string[];
    budget?: BudgetType;
    durationEstimate?: string;
    urgencyLevel?: "low" | "medium" | "high";
    status: "pending" | "in-progress" | "completed" | "on-hold";
    sowUrl?: string;
    developerId?: string[];
    media?: MediaType[];
    createdAt?: Date;
    updatedAt?: Date;
};