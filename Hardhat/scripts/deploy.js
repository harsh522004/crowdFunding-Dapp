const { ethers } = require("hardhat");

async function main() {
    // 1) Deploy master implementation
    const Master = await ethers.getContractFactory("CrowdFundingMaster");
    const master = await Master.deploy(); // logic contract, initialize will be called via clones
    await master.deployed();
    console.log("Master implementation deployed at:", master.address);

    // 2) Deploy factory, passing implementation address
    const Factory = await ethers.getContractFactory("CampaignProxyFactory");
    const factory = await Factory.deploy(master.address);
    await factory.deployed();
    console.log("CampaignProxyFactory deployed at:", factory.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
