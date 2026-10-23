import connectDB from "@/lib/mongodb";
import { KnowledgeItem, IKnowledgeItem, KnowledgeContentType } from "@/models/KnowledgeItem";
import { CURATED_KNOWLEDGE_BASE, CuratedKnowledgeChunk } from "./data";

export interface RetrievalQuery {
  targetRole?: string;
  skills?: string[];
  queryText?: string;
  contentTypes?: KnowledgeContentType[];
  limit?: number;
}

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  title: string;
  sourceUrl: string;
  contentType: KnowledgeContentType;
  roleTags: string[];
  skillTags: string[];
  prerequisites: string[];
  content: string;
  relevanceScore: number;
}

/**
 * Computes lexical relevance score between a query and a document.
 */
function scoreLexicalMatch(
  queryWords: string[],
  docText: string,
  docRoleTags: string[],
  docSkillTags: string[],
  targetRole?: string,
  userSkills?: string[]
): number {
  let score = 0;
  const lowerText = docText.toLowerCase();

  // Role tag matching (highest weight)
  if (targetRole) {
    const lowerRole = targetRole.toLowerCase();
    for (const roleTag of docRoleTags) {
      if (
        lowerRole.includes(roleTag.toLowerCase()) ||
        roleTag.toLowerCase().includes(lowerRole)
      ) {
        score += 35;
        break;
      }
    }
  }

  // Skill overlap
  if (userSkills && userSkills.length > 0) {
    for (const userSkill of userSkills) {
      const lowerSkill = userSkill.toLowerCase();
      for (const skillTag of docSkillTags) {
        if (
          lowerSkill === skillTag.toLowerCase() ||
          skillTag.toLowerCase().includes(lowerSkill)
        ) {
          score += 15;
        }
      }
    }
  }

  // Query words occurrence
  if (queryWords.length > 0) {
    for (const word of queryWords) {
      if (word.length < 3) continue;
      const count = (lowerText.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
      if (count > 0) {
        score += Math.min(count * 5, 20);
      }
    }
  }

  return score;
}

/**
 * Retrieves the most relevant knowledge chunks matching the given query parameters.
 * Automatically queries MongoDB KnowledgeItem collection with fallback to
 * in-memory curated knowledge base.
 */
export async function retrieveKnowledgeChunks(
  params: RetrievalQuery
): Promise<RetrievedChunk[]> {
  const {
    targetRole,
    skills = [],
    queryText = "",
    contentTypes,
    limit = 4,
  } = params;

  let candidates: CuratedKnowledgeChunk[] = [];

  try {
    await connectDB();
    const query: Record<string, unknown> = {};

    if (contentTypes && contentTypes.length > 0) {
      query.contentType = { $in: contentTypes };
    }

    const dbItems = await KnowledgeItem.find(query).lean();
    if (dbItems && dbItems.length > 0) {
      candidates = dbItems as unknown as CuratedKnowledgeChunk[];
    }
  } catch (err) {
    // If DB is offline or not yet initialized, gracefully use the curated in-memory dataset
    candidates = CURATED_KNOWLEDGE_BASE;
  }

  if (candidates.length === 0) {
    candidates = CURATED_KNOWLEDGE_BASE;
  }

  // Filter by contentTypes if specified
  if (contentTypes && contentTypes.length > 0) {
    candidates = candidates.filter((c) => contentTypes.includes(c.contentType));
  }

  const queryWords = queryText
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  // Score each candidate chunk
  const scored: RetrievedChunk[] = candidates.map((chunk) => {
    const relevanceScore = scoreLexicalMatch(
      queryWords,
      `${chunk.title} ${chunk.content}`,
      chunk.roleTags,
      chunk.skillTags,
      targetRole,
      skills
    );

    return {
      chunkId: chunk.chunkId,
      documentId: chunk.documentId,
      title: chunk.title,
      sourceUrl: chunk.sourceUrl,
      contentType: chunk.contentType,
      roleTags: chunk.roleTags,
      skillTags: chunk.skillTags,
      prerequisites: chunk.prerequisites,
      content: chunk.content,
      relevanceScore,
    };
  });

  // Sort descending by score, take top-k
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scored.slice(0, limit);
}

/**
 * Formats retrieved chunks into a structured prompt context block for Gemini.
 */
export function formatRetrievedContext(chunks: RetrievedChunk[]): string {
  if (!chunks || chunks.length === 0) {
    return "NO RELEVANT KNOWLEDGE BASE EVIDENCE AVAILABLE.";
  }

  return chunks
    .map(
      (chunk, index) =>
        `[SOURCE ${index + 1}: ${chunk.chunkId}]
Title: ${chunk.title}
URL: ${chunk.sourceUrl}
Type: ${chunk.contentType}
Prerequisites: ${chunk.prerequisites.length > 0 ? chunk.prerequisites.join(", ") : "None"}
Content: ${chunk.content}`
    )
    .join("\n\n");
}
