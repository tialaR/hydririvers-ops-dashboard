import type { CargoAgentInput, CargoAgentResponse } from '../types/cargo-agent.types';
import { resolveCargoAgentResponse } from '../utils/cargo-agent-rules';

export async function getCargoAgentResponse(input: CargoAgentInput): Promise<CargoAgentResponse> {
  return resolveCargoAgentResponse(input);
}

