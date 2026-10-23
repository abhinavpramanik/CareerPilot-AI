import { RetrievedChunk } from "./retrieval";

export interface CitationVerificationResult {
  valid: boolean;
  validCitations: string[];
  hallucinatedCitations: string[];
  resolvedSources: Array<{
    chunkId: string;
    title: string;
    sourceUrl: string;
  }>;
}

/**
 * Validates that every citation returned by the model corresponds
 * to an actual chunk in the retrieved context.
 * Rejects fabricated or hallucinated references.
 */
export function verifyCitations(
  citations: string[],
  retrievedChunks: RetrievedChunk[]
): CitationVerificationResult {
  const validChunkIds = new Set(retrievedChunks.map((c) => c.chunkId));
  const validUrls = new Set(retrievedChunks.map((c) => c.sourceUrl));

  const validCitations: string[] = [];
  const hallucinatedCitations: string[] = [];
  const resolvedSources: Array<{
    chunkId: string;
    title: string;
    sourceUrl: string;
  }> = [];

  for (const cit of citations) {
    const trimmed = cit.trim();
    if (!trimmed) continue;

    const matchedChunk = retrievedChunks.find(
      (c) => c.chunkId === trimmed || c.sourceUrl === trimmed
    );

    if (matchedChunk) {
      if (!validCitations.includes(matchedChunk.chunkId)) {
        validCitations.push(matchedChunk.chunkId);
        resolvedSources.push({
          chunkId: matchedChunk.chunkId,
          title: matchedChunk.title,
          sourceUrl: matchedChunk.sourceUrl,
        });
      }
    } else {
      hallucinatedCitations.push(trimmed);
    }
  }

  return {
    valid: hallucinatedCitations.length === 0,
    validCitations,
    hallucinatedCitations,
    resolvedSources,
  };
}
