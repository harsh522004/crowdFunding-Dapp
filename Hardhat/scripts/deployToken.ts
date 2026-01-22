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

async function main(){
    await displayInfo();
    const tokenContract = await ethers.deployContract("Karma");
    await tokenContract.waitForDeployment();
    const address : string = await tokenContract.getAddress();
    console.log(`Deplyed Token contract at : ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:");
    console.error(error);
    process.exit(1);
  });