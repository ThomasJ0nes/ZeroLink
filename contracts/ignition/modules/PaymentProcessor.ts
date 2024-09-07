import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PaymentProcessorModule = buildModule("PaymentProcessorModule", (m) => {
  // // Base Sepolia
  // const endpoint = m.getParameter("endpoint", "0x6EDCE65403992e310A62460808c4b910D972f10f");
  // const router = m.getParameter("router", "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93");
  // const usdc = m.getParameter("usdc", "0x036CbD53842c5426634e7929541eC2318f3dCF7e");

  // // Optimism Sepolia
  // const endpoint = m.getParameter("endpoint", "0x6EDCE65403992e310A62460808c4b910D972f10f");
  // const router = m.getParameter("router", "0x114A20A10b43D4115e5aeef7345a1A71d2a60C57");
  // const usdc = m.getParameter("usdc", "0x5fd84259d66Cd46123540766Be93DFE6D43130D7");

  // // Polygon Amoy
  // const endpoint = m.getParameter("endpoint", "0x6EDCE65403992e310A62460808c4b910D972f10f");
  // const router = m.getParameter("router", "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2");
  // const usdc = m.getParameter("usdc", "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582");

  // Avalanche Fuji
  const endpoint = m.getParameter("endpoint", "0x6EDCE65403992e310A62460808c4b910D972f10f");
  const router = m.getParameter("router", "0xF694E193200268f9a4868e4Aa017A0118C9a8177");
  const usdc = m.getParameter("usdc", "0x5425890298aed601595a70AB815c96711a31Bc65");

  const paymentProcessor = m.contract("PaymentProcessor", [endpoint, router, usdc]);

  return { paymentProcessor };
});

export default PaymentProcessorModule;
