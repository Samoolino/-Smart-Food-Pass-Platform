import hre from "hardhat";

async function deploy() {
  console.log("🚀 Deploying SmartFoodPass contract...");

  const SmartFoodPass = await hre.ethers.getContractFactory("SmartFoodPass");
  const contract = await SmartFoodPass.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ SmartFoodPass deployed to:", address);
  console.log("📝 Add this to your .env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    deploymentTime: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment.json");
}

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
