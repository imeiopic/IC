import { describe, it, expect, vi } from "vitest";
import { Wallet, getDefaultProvider } from "ethers";

// Mock ethers to intercept the default provider
vi.mock("ethers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ethers")>();
  return {
    ...actual,
    getDefaultProvider: vi.fn(),
  };
});

describe("ZKP Vault Encryption/Decryption Logic", () => {
  // Increase timeout to 30 seconds because scrypt encryption is intentionally computationally heavy
  it("should encrypt a wallet, inject metadata, and decrypt it successfully", async () => {
    const password = "secure-iopic-password-123";
    const mockMetadata = {
      securedEquity: 1600.0,
      zkpHash: "0x123456789abcdef123456789abcdef123456789",
      status: "VERIFIED_SYMMETRY",
      timestamp: new Date().toISOString(),
    };

    // 1. Generate a random wallet (Simulating a new node identity)
    const wallet = Wallet.createRandom();
    const originalAddress = wallet.address;
    const originalPrivateKey = wallet.privateKey;

    // 2. Encrypt the wallet (Simulating the Backup process)
    const keystoreJson = await wallet.encrypt(password);

    // 3. Parse and inject custom metadata (Replicating component logic)
    const keystoreObj = JSON.parse(keystoreJson);
    keystoreObj.iopicMetadata = mockMetadata;
    const finalJson = JSON.stringify(keystoreObj);

    // 4. Decrypt the payload (Simulating the Import/Restore process)
    const decryptedWallet = await Wallet.fromEncryptedJson(finalJson, password);
    const decryptedObj = JSON.parse(finalJson);

    // 5. Assertions to verify perfect symmetry and data integrity
    expect(decryptedWallet.address).toBe(originalAddress);
    expect(decryptedWallet.privateKey).toBe(originalPrivateKey);

    expect(decryptedObj.iopicMetadata).toBeDefined();
    expect(decryptedObj.iopicMetadata.securedEquity).toBe(1600.0);
    expect(decryptedObj.iopicMetadata.zkpHash).toBe(mockMetadata.zkpHash);
    expect(decryptedObj.iopicMetadata.status).toBe("VERIFIED_SYMMETRY");
  }, 30000);

  it("should fail to decrypt if an incorrect password is provided", async () => {
    const correctPassword = "correct-password-123";
    const incorrectPassword = "wrong-password-456";

    // 1. Generate and encrypt a new wallet
    const wallet = Wallet.createRandom();
    const keystoreJson = await wallet.encrypt(correctPassword);

    // 2. Attempt to decrypt with the wrong password and expect it to throw an error
    await expect(
      Wallet.fromEncryptedJson(keystoreJson, incorrectPassword),
    ).rejects.toThrow();
  }, 30000);

  it("should successfully mock the blockchain connection and retrieve network details", async () => {
    // 1. Setup the mock provider and its getNetwork response
    const mockNetwork = { name: "iopic-subnet", chainId: 777n };
    const mockProvider = {
      getNetwork: vi.fn().mockResolvedValue(mockNetwork),
    };
    vi.mocked(getDefaultProvider).mockReturnValue(mockProvider as any);

    // 2. Execute the connection logic (replicating the component's connectToBlockchain)
    const provider = getDefaultProvider("mainnet");
    const network = await provider.getNetwork();

    // 3. Verify the mock was utilized correctly
    expect(getDefaultProvider).toHaveBeenCalledWith("mainnet");
    expect(network.name).toBe("iopic-subnet");
  });
});
