const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", owner.address);

  // Deploy PolicyMaker
  const PolicyMakerFactory = await ethers.getContractFactory("PolicyMaker");
  const policyMaker = await PolicyMakerFactory.deploy(owner.address);
  await policyMaker.waitForDeployment();
  console.log("Policy Maker deployed to address: ", await policyMaker.getAddress());

  // Deploy other contracts here following the same pattern
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
