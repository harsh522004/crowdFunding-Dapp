import { network } from "hardhat";

const { ethers, networkName } = await network.connect();

async function displayInfo() {
    // Network
    console.log(`\n📡 Connected to network: ${networkName}`);

    // Deployer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deploying contracts with account: ${deployer.address}`);

    // Balance of ETH
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH\n`);
}

async function deployToken(): Promise<string> {
    console.log("🪙  Deploying Karma Token...");
    const tokenContract = await ethers.deployContract("Karma");
    await tokenContract.waitForDeployment();
    const address: string = await tokenContract.getAddress();
    console.log(`✅ Token deployed at: ${address}\n`);
    return address;
}

// Function to deploy Campaign (Master) contract
async function deployCampaign(): Promise<string> {
    console.log("📋 Deploying CrowdFundingCampaign (Implementation)...");
    const campaignContract = await ethers.deployContract("CrowdFundingCampaign");
    await campaignContract.waitForDeployment();

    const address: string = await campaignContract.getAddress();
    console.log(`✅ Campaign Implementation deployed at: ${address}\n`);
    return address;
}

// Function to deploy Factory contract
async function deployFactory(
    campaignImplementation: string,
    tokenAddress: string
): Promise<string> {
    console.log("🏭 Deploying CrowdFundingFactory...");
    const factoryContract = await ethers.deployContract("CrowdFundingFactory", [
        campaignImplementation,
        tokenAddress,
    ]);
    await factoryContract.waitForDeployment();
    const address: string = await factoryContract.getAddress();
    console.log(`✅ Factory deployed at: ${address}\n`);
    return address;
}

// First entry point
async function main() {
    console.log("╔════════════════════════════════════════════════╗");
    console.log("║  CrowdFunding DApp Deployment Script          ║");
    console.log("╚════════════════════════════════════════════════╝");

    await displayInfo();

    const tokenAddress: string = await deployToken();
    const campaignImplementation: string = await deployCampaign();
    const factoryAddress: string = await deployFactory(
        campaignImplementation,
        tokenAddress
    );

    console.log("\n╔════════════════════════════════════════════════╗");
    console.log("║           DEPLOYMENT COMPLETE ✅                ║");
    console.log("╚════════════════════════════════════════════════╝\n");
    console.log("📝 Contract Addresses:");
    console.log(`   Token (Karma):         ${tokenAddress}`);
    console.log(`   Campaign (Impl):       ${campaignImplementation}`);
    console.log(`   Factory:               ${factoryAddress}`);
    console.log(`   Network:               ${networkName}`);
    console.log("\n📋 Next Steps:");
    console.log("   1. Update frontend config.ts with these addresses");
    console.log("   2. Approve tokens for the factory contract");
    console.log("   3. Regenerate ABIs if contract interfaces changed");
    console.log("\n════════════════════════════════════════════════\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });