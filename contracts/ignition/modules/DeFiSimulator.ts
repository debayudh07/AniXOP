import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeFiSimulatorModule = buildModule("DeFiSimulatorModule", (m) => {
  const defiSimulator = m.contract("DeFiSimulator");

  return { defiSimulator };
});

export default DeFiSimulatorModule;

