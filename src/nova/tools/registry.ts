// ==============================================================================
// TUNITRIP NOVA — CENTRALIZED TOOL REGISTRY
// Registers only grounded tools; catalogues future provider-backed capabilities
// ==============================================================================

import { NovaTool, NovaToolContext, ToolExecutionResult } from './types';
import { LLMToolDefinition } from '../providers/types';
import { SearchPlacesTool } from './searchPlaces';
import { GetPlaceDetailsTool } from './getPlaceDetails';
import { BuildItineraryTool } from './buildItinerary';
import { CalculateBudgetTool } from './calculateBudget';
import { OptimizeRouteTool } from './optimizeRoute';
import { NovaError } from '../core/errors';

export interface FutureToolCapability {
  name: string;
  category: 'accommodation' | 'dining' | 'activities' | 'booking';
  description: string;
  status: 'planned_future_provider';
  requiredProviderType: string;
}

export class NovaToolRegistry {
  private static instance: NovaToolRegistry;
  private tools: Map<string, NovaTool> = new Map();

  // Future capabilities catalog (Section 8: catalogued but not executed until real provider exists)
  private readonly futureCapabilities: FutureToolCapability[] = [
    {
      name: 'search_hotels',
      category: 'accommodation',
      description: 'Live room inventory search via GDS / Hotelbeds partner API',
      status: 'planned_future_provider',
      requiredProviderType: 'Channel Manager / Hotel API',
    },
    {
      name: 'search_restaurants',
      category: 'dining',
      description: 'Live table reservations via local dining partner booking integration',
      status: 'planned_future_provider',
      requiredProviderType: 'Table Reservation API',
    },
    {
      name: 'search_activities',
      category: 'activities',
      description: 'Live ticket inventory and time-slot booking via theme park API',
      status: 'planned_future_provider',
      requiredProviderType: 'Ticketing Partner API',
    },
    {
      name: 'check_availability',
      category: 'booking',
      description: 'Real-time room and transfer fleet availability check',
      status: 'planned_future_provider',
      requiredProviderType: 'Supplier GDS API',
    },
    {
      name: 'create_reservation',
      category: 'booking',
      description: 'Financial checkout and booking lock with payment gateway',
      status: 'planned_future_provider',
      requiredProviderType: 'Payment Gateway + Partner Lock',
    },
  ];

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): NovaToolRegistry {
    if (!NovaToolRegistry.instance) {
      NovaToolRegistry.instance = new NovaToolRegistry();
    }
    return NovaToolRegistry.instance;
  }

  private registerDefaults(): void {
    this.register(new SearchPlacesTool());
    this.register(new GetPlaceDetailsTool());
    this.register(new BuildItineraryTool());
    this.register(new CalculateBudgetTool());
    this.register(new OptimizeRouteTool());
  }

  public register(tool: NovaTool): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): NovaTool | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): NovaTool[] {
    return Array.from(this.tools.values());
  }

  public getToolDefinitions(): LLMToolDefinition[] {
    return this.getAllTools().map((t) => t.definition);
  }

  public async execute(
    name: string,
    args: Record<string, any>,
    context?: NovaToolContext
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      // Check if it was requested against an un-backed future tool
      const futureTool = this.futureCapabilities.find((f) => f.name === name);
      if (futureTool) {
        throw NovaError.toolError(
          name,
          `Tool '${name}' is reserved for future live provider integration (${futureTool.requiredProviderType}) and is not currently activated to prevent ungrounded hallucinations.`
        );
      }
      throw NovaError.toolError(name, `Tool '${name}' is not registered in the NOVA Tool Registry.`);
    }

    try {
      return await tool.execute(args, context);
    } catch (err: any) {
      if (err instanceof NovaError) throw err;
      throw NovaError.toolError(name, err.message, err);
    }
  }

  public getFutureCapabilities(): FutureToolCapability[] {
    return [...this.futureCapabilities];
  }
}

export const toolRegistry = NovaToolRegistry.getInstance();
