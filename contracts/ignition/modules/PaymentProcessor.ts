import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PaymentProcessorModule = buildModule("PaymentProcessorModule", (m) => {
  // // Base Sepolia
  // const endpoint = m.getParameter("endpoint", "0x6EDCE65403992e310A62460808c4b910D972f10f");
  // const router = m.getParameter("router", "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93");
  // const usdc = m.getParameter("usdc", "0x036CbD53842c5426634e7929541eC2318f3dCF7e");

  // OP Sepolia
  const endpoint = m.getParameter("endpoint", "0x6EDCE65403992e310A62460808c4b910D972f10f");
  const router = m.getParameter("router", "0x114A20A10b43D4115e5aeef7345a1A71d2a60C57");
  const usdc = m.getParameter("usdc", "0x5fd84259d66Cd46123540766Be93DFE6D43130D7");

  const paymentProcessor = m.contract("PaymentProcessor", [endpoint, router, usdc]);

  return { paymentProcessor };
});

export default PaymentProcessorModule;
