import { IKeys, MediaType, ReviewType } from "../shared.types";

export interface IClient extends Document {
    name: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
    address?: string;
    companySize?: string;
    industry?: string;
    companyWebsite?: string;
    media?: MediaType[];
    projectsPosted?: string[];
    isVerified?: boolean;
    reviews?: ReviewType[];
    developersHired?: string[];
    keys: IKeys;
    createdAt?: Date;
    updatedAt?: Date;
}