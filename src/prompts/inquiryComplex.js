/**
 * AI prompts for generating Inquiry Complex content
 * Each prompt is designed to generate specific types of intellectual engagement
 */

/**
 * Generate the central point for a new inquiry complex
 */
export const generateCentralPointPrompt = (question) => `
You are a philosopher and critical thinker tasked with formulating a central intellectual position.

INQUIRY QUESTION: "${question}"

Generate a thoughtful, substantive central point that:
1. Takes a clear position on the question
2. Provides initial reasoning or evidence
3. Is intellectually honest and nuanced
4. Invites serious intellectual engagement
5. Is substantial enough to support recursive exploration

The central point should be:
- 2-4 sentences long
- Intellectually rigorous
- Neither obviously true nor obviously false
- Capable of generating meaningful objections and discussion

Respond with ONLY valid JSON:

{
  "content": "The substantive intellectual position addressing the question",
  "strength": 0.75,
  "tags": ["relevant", "philosophical", "tags"],
  "keyTerms": ["important", "concepts", "mentioned"],
  "reasoning": "Brief explanation of the logical foundation"
}
`;

/**
 * Generate objections to an existing point
 */
export const generateObjectionsPrompt = (parentContent, centralQuestion, complexPath) => `
You are a critical philosopher skilled in dialectical reasoning. Generate substantive objections to an intellectual position.

CENTRAL QUESTION: "${centralQuestion}"

INTELLECTUAL PATH TO CURRENT POINT:
${complexPath.map((node, i) => `${i + 1}. [${node.type.toUpperCase()}] ${node.summary}`).join('\n')}

TARGET POSITION: "${parentContent}"

Generate 2-3 distinct, substantial objections that:
1. Challenge different aspects of the position
2. Use various argumentative strategies (logical, empirical, conceptual, practical)
3. Are intellectually honest - not strawman attacks
4. Reveal genuine weaknesses or problems
5. Could lead to productive further discussion

Each objection should be 1-3 sentences and represent a different angle of critique.

Respond with ONLY valid JSON:

{
  "objections": [
    {
      "content": "First objection content",
      "type": "logical|empirical|conceptual|practical|ethical",
      "strength": 0.65,
      "focusArea": "What aspect this objection targets",
      "tags": ["relevant", "tags"]
    },
    {
      "content": "Second objection content", 
      "type": "logical|empirical|conceptual|practical|ethical",
      "strength": 0.70,
      "focusArea": "What aspect this objection targets",
      "tags": ["relevant", "tags"]
    }
  ]
}
`;

/**
 * Generate refutations to objections
 */
export const generateRefutationPrompt = (objectionContent, originalPoint, centralQuestion, complexPath) => `
You are a skilled dialectical thinker defending an intellectual position against objections.

CENTRAL QUESTION: "${centralQuestion}"

INTELLECTUAL PATH:
${complexPath.map((node, i) => `${i + 1}. [${node.type.toUpperCase()}] ${node.summary}`).join('\n')}

ORIGINAL POSITION: "${originalPoint}"

OBJECTION TO REFUTE: "${objectionContent}"

Generate a substantive refutation that:
1. Directly addresses the objection's core challenge
2. Uses sound reasoning and evidence where possible
3. Acknowledges any valid concerns while defending the position
4. Strengthens or clarifies the original position
5. Maintains intellectual honesty

The refutation should be 2-4 sentences and genuinely engage with the objection.

Respond with ONLY valid JSON:

{
  "content": "The refutation content that addresses the objection",
  "strategy": "clarification|counterevidence|reframing|qualification|strengthening",
  "strength": 0.68,
  "concessions": "Any valid points acknowledged in the objection",
  "newClarifications": "Any important clarifications added to original position",
  "tags": ["relevant", "tags"]
}
`;

/**
 * Generate syntheses between opposing viewpoints
 */
export const generateSynthesisPrompt = (point1, point2, centralQuestion, complexPath) => `
You are a philosopher skilled in dialectical synthesis, finding higher-order resolutions to intellectual tensions.

CENTRAL QUESTION: "${centralQuestion}"

INTELLECTUAL PATH:
${complexPath.map((node, i) => `${i + 1}. [${node.type.toUpperCase()}] ${node.summary}`).join('\n')}

POSITION 1: "${point1}"

POSITION 2: "${point2}"

Generate a synthesis that:
1. Acknowledges the legitimate insights in both positions
2. Transcends the apparent contradiction through a higher-order perspective
3. Creates a new position that incorporates strengths of both
4. Addresses the underlying concerns that generated the opposition
5. Opens new avenues for exploration

The synthesis should be 3-5 sentences and represent genuine intellectual progress.

Respond with ONLY valid JSON:

{
  "content": "The synthesis content that integrates both positions",
  "approach": "dialectical|pragmatic|conceptual|reframing|hierarchical",
  "strength": 0.80,
  "preservedElements": ["What key insights from each position are preserved"],
  "newInsight": "The novel perspective or understanding generated",
  "implications": "What this synthesis suggests about the broader question",
  "tags": ["relevant", "tags"]
}
`;

/**
 * Generate follow-up questions for deeper exploration
 */
export const generateFollowUpQuestionsPrompt = (currentNode, centralQuestion, complexPath) => `
You are an intellectual explorer identifying productive directions for deeper inquiry.

CENTRAL QUESTION: "${centralQuestion}"

CURRENT INTELLECTUAL PATH:
${complexPath.map((node, i) => `${i + 1}. [${node.type.toUpperCase()}] ${node.summary}`).join('\n')}

CURRENT POSITION: "${currentNode.content}"

Generate 3-4 follow-up questions that:
1. Probe deeper into assumptions or implications
2. Explore practical consequences or applications
3. Investigate related philosophical or empirical issues
4. Challenge the position from new angles
5. Connect to broader intellectual frameworks

Each question should open genuinely new avenues for exploration.

Respond with ONLY valid JSON:

{
  "questions": [
    {
      "question": "First follow-up question",
      "type": "assumption|implication|application|connection|challenge",
      "depth": "deeper|broader|practical|theoretical",
      "rationale": "Why this question matters for the inquiry"
    }
  ]
}
`;

/**
 * Analyze the strength and coherence of an inquiry complex
 */
export const analyzeComplexPrompt = (complexSummary, centralQuestion) => `
You are an expert in philosophical analysis evaluating the intellectual coherence of a complex inquiry.

CENTRAL QUESTION: "${centralQuestion}"

INQUIRY COMPLEX STRUCTURE:
${complexSummary}

Analyze this inquiry complex for:
1. Intellectual rigor and coherence
2. Balance of perspectives and viewpoints
3. Depth and sophistication of exploration
4. Identification of weak or underdeveloped areas
5. Suggestions for productive further exploration

Respond with ONLY valid JSON:

{
  "overallStrength": 0.75,
  "coherenceScore": 0.80,
  "balanceScore": 0.70,
  "depthScore": 0.85,
  "weakAreas": ["Areas that need more development"],
  "strongAreas": ["Well-developed aspects of the inquiry"],
  "suggestions": ["Specific recommendations for further exploration"],
  "missingPerspectives": ["Important viewpoints not yet considered"],
  "keyInsights": ["Most important insights generated by this complex"]
}
`;

/**
 * Helper function to create complex path description
 */
export const createComplexPathDescription = (path) => {
  return path.map((node, index) => {
    const depth = '  '.repeat(index);
    return `${depth}${index + 1}. [${node.type.toUpperCase()}] ${node.summary}`;
  }).join('\n');
};

/**
 * Helper function to create complex summary for analysis
 */
export const createComplexSummary = (complex) => {
  const nodesByType = {
    point: [],
    objection: [],
    synthesis: [],
    refutation: []
  };

  for (const node of complex.nodes.values()) {
    nodesByType[node.type].push({
      id: node.id,
      summary: node.summary,
      depth: node.depth,
      strength: node.metadata.strength
    });
  }

  let summary = `COMPLEX OVERVIEW:\n`;
  summary += `- Central Question: ${complex.centralQuestion}\n`;
  summary += `- Total Nodes: ${complex.nodes.size}\n`;
  summary += `- Max Depth: ${complex.metadata.maxDepth}\n\n`;

  Object.entries(nodesByType).forEach(([type, nodes]) => {
    if (nodes.length > 0) {
      summary += `${type.toUpperCase()}S (${nodes.length}):\n`;
      nodes.forEach(node => {
        summary += `  - [Depth ${node.depth}, Strength ${node.strength}] ${node.summary}\n`;
      });
      summary += '\n';
    }
  });

  return summary;
};

export default {
  generateCentralPointPrompt,
  generateObjectionsPrompt,
  generateRefutationPrompt,
  generateSynthesisPrompt,
  generateFollowUpQuestionsPrompt,
  analyzeComplexPrompt,
  createComplexPathDescription,
  createComplexSummary
};