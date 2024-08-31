import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PaymentProcessorModule = buildModule("PaymentProcessorModule", (m) => {
  const endpoint = m.getParameter("endpoint", "0x6EDCE65403992e310A62460808c4b910D972f10f");
  const router = m.getParameter("router", "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93");
  const link = m.getParameter("link", "0xE4aB69C077896252FAFBD49EFD26B5D171A32410");

  const paymentProcessor = m.contract("PaymentProcessor", [endpoint, router, link]);

  return { paymentProcessor };
});

export default PaymentProcessorModule;
