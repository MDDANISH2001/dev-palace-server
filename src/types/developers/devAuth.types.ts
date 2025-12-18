import { IKeys, MediaType, ReviewType } from "../shared.types";

export interface IDeveloper extends Document {
  name: string;
  email: string;
  password: string;
  profileImg?: string;
  phone?: string;
  company?: string;
  address?: string;
  skills?: string[];
  experience?: number;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  media?: MediaType[];
  projectsCompleted?: string[];
  reviews?: ReviewType[];
  hourlyRate?: number;
  availibility?: "available" | "offline" | "busy";
  isVerified?: boolean;
  instantProjectsEnabled?: boolean;
  keys: IKeys;
  createdAt?: Date;
  updatedAt?: Date;
}
