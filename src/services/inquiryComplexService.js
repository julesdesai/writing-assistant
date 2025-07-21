import aiService from './aiService';
import InquiryComplexFactory, { NodeTypes } from '../types/inquiryComplex';
import inquiryPrompts from '../prompts/inquiryComplex';

/**
 * Service for generating and managing Inquiry Complexes using AI
 */
class InquiryComplexService {
  constructor() {
    this.activeComplexes = new Map();
    this.generationQueue = [];
    this.isProcessing = false;
  }

  /**
   * Create a new inquiry complex from a question
   */
  async createComplex(question) {
    try {
      // Generate central point using AI
      const centralPointPrompt = inquiryPrompts.generateCentralPointPrompt(question);
      const response = await aiService.callAPI(centralPointPrompt, undefined, {
        temperature: 0.7,
        maxTokens: 400
      });

      const centralPointData = this.parseAIResponse(response);
      
      // Create the complex structure
      const complex = InquiryComplexFactory.createComplex(
        question,
        centralPointData.content
      );

      // Enhance central node with AI-generated metadata
      const centralNode = complex.nodes.get(complex.centralPointId);
      centralNode.metadata = {
        ...centralNode.metadata,
        strength: centralPointData.strength || 0.8,
        tags: centralPointData.tags || [],
        keyTerms: centralPointData.keyTerms || [],
        reasoning: centralPointData.reasoning || ''
      };

      // Store the complex
      this.activeComplexes.set(complex.id, complex);

      return complex;
    } catch (error) {
      console.error('Failed to create inquiry complex:', error);
      throw error;
    }
  }

  /**
   * Expand a node by generating its children (objections, refutations, syntheses)
   */
  async expandNode(complexId, nodeId, expansionType = 'objections') {
    const complex = this.activeComplexes.get(complexId);
    if (!complex) {
      throw new Error('Complex not found');
    }

    const node = complex.nodes.get(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }

    try {
      switch (expansionType) {
        case 'objections':
          return await this.generateObjections(complex, nodeId);
        case 'refutation':
          return await this.generateRefutation(complex, nodeId);
        case 'synthesis':
          return await this.generateSynthesis(complex, nodeId);
        default:
          throw new Error(`Unknown expansion type: ${expansionType}`);
      }
    } catch (error) {
      console.error(`Failed to expand node ${nodeId}:`, error);
      throw error;
    }
  }

  /**
   * Generate objections to a point
   */
  async generateObjections(complex, pointId) {
    const point = complex.nodes.get(pointId);
    const path = InquiryComplexFactory.getPathToNode(complex, pointId);
    
    const prompt = inquiryPrompts.generateObjectionsPrompt(
      point.content,
      complex.centralQuestion,
      path
    );

    const response = await aiService.callAPI(prompt, undefined, {
      temperature: 0.8,
      maxTokens: 600
    });

    const objectionsData = this.parseAIResponse(response);
    const newNodeIds = [];

    for (const objectionData of objectionsData.objections) {
      const nodeId = InquiryComplexFactory.addNode(
        complex,
        pointId,
        NodeTypes.OBJECTION,
        objectionData.content
      );

      // Enhance with AI metadata
      const node = complex.nodes.get(nodeId);
      node.metadata = {
        ...node.metadata,
        strength: objectionData.strength || 0.6,
        tags: objectionData.tags || [],
        objectionType: objectionData.type,
        focusArea: objectionData.focusArea
      };

      newNodeIds.push(nodeId);
    }

    return newNodeIds;
  }

  /**
   * Generate a refutation to an objection
   */
  async generateRefutation(complex, objectionId) {
    const objection = complex.nodes.get(objectionId);
    const originalPoint = complex.nodes.get(objection.parentId);
    const path = InquiryComplexFactory.getPathToNode(complex, objectionId);

    const prompt = inquiryPrompts.generateRefutationPrompt(
      objection.content,
      originalPoint.content,
      complex.centralQuestion,
      path
    );

    const response = await aiService.callAPI(prompt, undefined, {
      temperature: 0.7,
      maxTokens: 500
    });

    const refutationData = this.parseAIResponse(response);

    const nodeId = InquiryComplexFactory.addNode(
      complex,
      objectionId,
      NodeTypes.REFUTATION,
      refutationData.content
    );

    // Enhance with AI metadata
    const node = complex.nodes.get(nodeId);
    node.metadata = {
      ...node.metadata,
      strength: refutationData.strength || 0.7,
      tags: refutationData.tags || [],
      strategy: refutationData.strategy,
      concessions: refutationData.concessions,
      newClarifications: refutationData.newClarifications
    };

    return nodeId;
  }

  /**
   * Generate synthesis between two opposing points
   */
  async generateSynthesis(complex, nodeId1, nodeId2 = null) {
    let point1, point2, parentId;

    if (nodeId2) {
      // Synthesis between two specific nodes
      point1 = complex.nodes.get(nodeId1);
      point2 = complex.nodes.get(nodeId2);
      // Find common parent for placement
      parentId = this.findCommonParent(complex, nodeId1, nodeId2);
    } else {
      // Synthesis between a point and its strongest objection
      point1 = complex.nodes.get(nodeId1);
      const objections = point1.childIds
        .map(id => complex.nodes.get(id))
        .filter(node => node.type === NodeTypes.OBJECTION)
        .sort((a, b) => b.metadata.strength - a.metadata.strength);
      
      if (objections.length === 0) {
        throw new Error('No objections found to synthesize with');
      }
      
      point2 = objections[0];
      parentId = nodeId1;
    }

    const path = InquiryComplexFactory.getPathToNode(complex, parentId);

    const prompt = inquiryPrompts.generateSynthesisPrompt(
      point1.content,
      point2.content,
      complex.centralQuestion,
      path
    );

    const response = await aiService.callAPI(prompt, undefined, {
      temperature: 0.8,
      maxTokens: 700
    });

    const synthesisData = this.parseAIResponse(response);

    const nodeId = InquiryComplexFactory.addNode(
      complex,
      parentId,
      NodeTypes.SYNTHESIS,
      synthesisData.content
    );

    // Enhance with AI metadata
    const node = complex.nodes.get(nodeId);
    node.metadata = {
      ...node.metadata,
      strength: synthesisData.strength || 0.8,
      tags: synthesisData.tags || [],
      approach: synthesisData.approach,
      preservedElements: synthesisData.preservedElements || [],
      newInsight: synthesisData.newInsight,
      implications: synthesisData.implications
    };

    return nodeId;
  }

  /**
   * Auto-expand a complex to a certain depth with balanced exploration
   */
  async autoExpand(complexId, targetDepth = 3, maxNodes = 20) {
    const complex = this.activeComplexes.get(complexId);
    if (!complex) {
      throw new Error('Complex not found');
    }

    const expansionPlan = this.planAutoExpansion(complex, targetDepth, maxNodes);
    
    for (const step of expansionPlan) {
      try {
        await this.expandNode(complexId, step.nodeId, step.type);
        
        // Small delay to avoid overwhelming the AI service
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Auto-expansion step failed:`, error);
        // Continue with remaining steps
      }
    }

    return complex;
  }

  /**
   * Plan the sequence of expansions for auto-expand
   */
  planAutoExpansion(complex, targetDepth, maxNodes) {
    const plan = [];
    const currentNodes = Array.from(complex.nodes.values())
      .filter(node => node.depth < targetDepth)
      .sort((a, b) => a.depth - b.depth || b.metadata.strength - a.metadata.strength);

    for (const node of currentNodes) {
      if (plan.length >= maxNodes) break;

      if (node.type === NodeTypes.POINT && node.childIds.length === 0) {
        // Generate objections for unexplored points
        plan.push({ nodeId: node.id, type: 'objections' });
      } else if (node.type === NodeTypes.OBJECTION && node.childIds.length === 0) {
        // Generate refutations for unrefuted objections
        plan.push({ nodeId: node.id, type: 'refutation' });
      }

      // Occasionally generate syntheses
      if (node.type === NodeTypes.POINT && 
          node.childIds.length > 1 && 
          Math.random() < 0.3) {
        plan.push({ nodeId: node.id, type: 'synthesis' });
      }
    }

    return plan;
  }

  /**
   * Analyze the overall complex for insights and suggestions
   */
  async analyzeComplex(complexId) {
    const complex = this.activeComplexes.get(complexId);
    if (!complex) {
      throw new Error('Complex not found');
    }

    const complexSummary = inquiryPrompts.createComplexSummary(complex);
    const prompt = inquiryPrompts.analyzeComplexPrompt(complexSummary, complex.centralQuestion);

    const response = await aiService.callAPI(prompt, undefined, {
      temperature: 0.6,
      maxTokens: 800
    });

    return this.parseAIResponse(response);
  }

  /**
   * Find common parent of two nodes
   */
  findCommonParent(complex, nodeId1, nodeId2) {
    const path1 = InquiryComplexFactory.getPathToNode(complex, nodeId1);
    const path2 = InquiryComplexFactory.getPathToNode(complex, nodeId2);

    // Find last common node in paths
    for (let i = 0; i < Math.min(path1.length, path2.length); i++) {
      if (path1[i].id !== path2[i].id) {
        return i > 0 ? path1[i - 1].id : complex.centralPointId;
      }
    }

    return path1.length < path2.length ? path1[path1.length - 1].id : path2[path2.length - 1].id;
  }

  /**
   * Parse AI response with error handling
   */
  parseAIResponse(response) {
    try {
      let cleanResponse = response.trim();
      
      // Clean common AI response formatting
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Extract JSON from response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.log('Raw response:', response);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Export complex for persistence
   */
  exportComplex(complexId) {
    const complex = this.activeComplexes.get(complexId);
    if (!complex) {
      throw new Error('Complex not found');
    }

    return InquiryComplexFactory.serialize(complex);
  }

  /**
   * Import complex from saved data
   */
  importComplex(data) {
    const complex = InquiryComplexFactory.deserialize(data);
    this.activeComplexes.set(complex.id, complex);
    return complex;
  }

  /**
   * Get all active complexes
   */
  getAllComplexes() {
    return Array.from(this.activeComplexes.values());
  }

  /**
   * Delete a complex
   */
  deleteComplex(complexId) {
    return this.activeComplexes.delete(complexId);
  }
}

export default new InquiryComplexService();