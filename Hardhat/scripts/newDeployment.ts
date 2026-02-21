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

async function deployToken(): Promise<string>{
    const tokenContract = await ethers.deployContract("Karma");
    await tokenContract.waitForDeployment();
    const address : string = await tokenContract.getAddress();
    console.log(`Deplyed Token contract at : ${address}`);
    return address;
}


// Function to deploy Master contract
async function deployMaster(): Promise<string>{
    const masterContract = await ethers.deployContract("CrowdFundingCampaign");
    await masterContract.waitForDeployment();

    const address: string = await masterContract.getAddress();
    // address of master contract 
    console.log(`Deplyed Master contract at : ${address}`);
    return address;


}

// Function to deploy Factory contract
async function deployFactory(masterContractAddress : string, tokenAddress: string) : Promise<string>{
  const factoryContract = await ethers.deployContract("CrowdFundingFactory",[masterContractAddress, tokenAddress]);
  await factoryContract.waitForDeployment();
  const address: string = await factoryContract.getAddress();
  console.log(`Deplyed Factory contract at : ${address}`);
  return address;
}



// First entry point
async function main(){
    
    await displayInfo();
    const tokenAddress : string = "0x058F7515Ecb2993e8E63037506F055a113386F65";
    const masterAddress : string = await deployMaster();
    const factoryAddress : string = await deployFactory(masterAddress,tokenAddress);
    console.log("\n=== Deployment Complete ===");
    console.log(`Token:   ${tokenAddress}`);
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