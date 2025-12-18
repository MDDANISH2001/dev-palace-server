import { randomBytes, createCipheriv } from "crypto";

const encryptMessage = (message: string, credential: string) => {
  const key = Buffer.from(credential, "utf-8");
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encryptedMessage = Buffer.concat([
    cipher.update(message, "utf-8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    encryptedMessage: encryptedMessage.toString("hex"),
    tag: tag.toString("hex"),
  };
};


export default encryptMessage;