import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const SubscriptionManagerModule = buildModule("SubscriptionManagerModule", (m) => {
  const endpoint = m.getParameter("_endpoint", "0x6EDCE65403992e310A62460808c4b910D972f10f");

  const subscriptionManager = m.contract("SubscriptionManager", [endpoint]);

  return { subscriptionManager };
});

export default SubscriptionManagerModule;
