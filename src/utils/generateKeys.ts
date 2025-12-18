import sodium from "libsodium-wrappers";

const generateUserKeys = async () => {
  await sodium.ready;
  return Promise.resolve(sodium.crypto_kx_keypair());
};

const generateRootKey = async () => {
  await sodium.ready;
  const symmetricKey = sodium.crypto_secretstream_xchacha20poly1305_keygen();
  const hexRootKey = sodium.to_hex(symmetricKey);
  return Promise.resolve(hexRootKey);
};

export { generateUserKeys, generateRootKey };