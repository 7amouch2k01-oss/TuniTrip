import { AgentTool } from '../ai/types';
import { GooglePlacesTool } from './googlePlacesTool';
import { WebSearchTool } from './webSearchTool';
import { GoogleRoutesTool } from './googleRoutesTool';
import { WeatherTool } from './weatherTool';
import { ExchangeRateTool } from './exchangeRateTool';
import { RagTool } from './ragTool';

export {
  GooglePlacesTool,
  WebSearchTool,
  GoogleRoutesTool,
  WeatherTool,
  ExchangeRateTool,
  RagTool,
};

export function createDefaultAgentTools(): AgentTool[] {
  return [
    new GooglePlacesTool(),
    new WebSearchTool(),
    new GoogleRoutesTool(),
    new WeatherTool(),
    new ExchangeRateTool(),
    new RagTool(),
  ];
}
