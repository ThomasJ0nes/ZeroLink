async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const endpointAddress = "0x6EDCE65403992e310A62460808c4b910D972f10f"; // Replace with the actual endpoint address
    //chainlink router Optimism Sepolia
    const routerAddress = "0x114A20A10b43D4115e5aeef7345a1A71d2a60C57"; // Replace with the actual router address
    //link 0xE4aB69C077896252FAFBD49EFD26B5D171A32410
    const linkAddress = "0xE4aB69C077896252FAFBD49EFD26B5D171A32410"; // Replace with the actual LINK token address
  
    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    const paymentProcessor = await PaymentProcessor.deploy(endpointAddress, routerAddress, linkAddress);
  
    console.log("PaymentProcessor deployed to:", paymentProcessor.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  