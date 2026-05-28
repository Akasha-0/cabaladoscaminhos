export interface FlowConfig {
  minFlow: number;
  maxFlow: number;
  unit: string;
}

export interface FlowState {
  current: number;
  config: FlowConfig;
}

export interface EnergyFlow {
  getFlow(): FlowState;
  setFlow(value: number): void;
}

let currentFlow = 50;

const defaultConfig: FlowConfig = {
  minFlow: 0,
  maxFlow: 100,
  unit: 'units',
};

export function getFlow(): FlowState {
  return {
    current: currentFlow,
    config: { ...defaultConfig },
  };
}

export function setFlow(value: number): void {
  currentFlow = Math.max(
    defaultConfig.minFlow,
    Math.min(defaultConfig.maxFlow, value)
  );
}

export const energyFlow: EnergyFlow = {
  getFlow,
  setFlow,
};