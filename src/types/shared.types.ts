export interface MediaType {
  mediaUrl: string;
  mediaId: string;
  mediaName: string;
}

export interface ReviewType {
  reviewerId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attachments {
  mediaUrl: string;
  mediaName: string;
}

export interface IKeys {
  publicKey: string;
  privateKey: {
    iv: string;
    encryptedMessage: string;
    tag: string;
  };
  rootKey: {
    iv: string;
    encryptedMessage: string;
    tag: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
