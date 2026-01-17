import { network } from "hardhat";


const {ethers , networkName } = await network.connect();



async function displayInfo (){

    // Network
    console.log(`Connected to network: ${networkName}`);

    // Deployer
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account: ${deployer.address}`);

    // balance of ETH
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);
}

// Function to deploy Master contract
async function deployMaster(): Promise<string>{
    const masterContract = await ethers.deployContract("CrowdFundingMaster");
    await masterContract.waitForDeployment();

    const address: string = await masterContract.getAddress();
    // address of master contract 
    console.log(`Deplyed Master contract at : ${address}`);
    return address;


}

// Function to deploy Factory contract
async function deployFactory(masterContractAddress : string) : Promise<string>{
  const factoryContract = await ethers.deployContract("CampaignProxyFactory",[masterContractAddress]);
  await factoryContract.waitForDeployment();
  const address: string = await factoryContract.getAddress();
  console.log(`Deplyed Factory contract at : ${address}`);
  return address;
}



// First entry point
async function main(){
    
    await displayInfo();
    const masterAddress : string = await deployMaster();
    const factoryAddress : string = await deployFactory(masterAddress);
    console.log("\n=== Deployment Complete ===");
    console.log(`Master:  ${masterAddress}`);
    console.log(`Factory: ${factoryAddress}`);
    console.log(`Network: ${networkName}`);
    console.log("===========================\n");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:");
    console.error(error);
    process.exit(1);
  });