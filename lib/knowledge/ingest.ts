import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { KnowledgeItem, IKnowledgeItem } from "@/models/KnowledgeItem";
import { CURATED_KNOWLEDGE_BASE, CuratedKnowledgeChunk } from "./data";

export interface IngestionResult {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * Computes a SHA-256 hash of the normalized chunk content
 * to ensure idempotent updates.
 */
export function computeContentHash(content: string, title: string, sourceUrl: string): string {
  const normalized = `${title.trim()}||${sourceUrl.trim()}||${content.trim().replace(/\s+/g, " ")}`;
  return crypto.createHash("sha256").update(normalized, "utf8").digest("hex");
}

/**
 * Ingests curated knowledge items into the database.
 * Completely idempotent: if a chunk with the same chunkId and contentHash
 * already exists, it is skipped without modification.
 */
export async function ingestKnowledgeBase(
  customChunks?: CuratedKnowledgeChunk[]
): Promise<IngestionResult> {
  await connectDB();

  const chunks = customChunks ?? CURATED_KNOWLEDGE_BASE;
  const result: IngestionResult = {
    total: chunks.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (const chunk of chunks) {
    try {
      const contentHash = computeContentHash(chunk.content, chunk.title, chunk.sourceUrl);

      // Check if this chunk is already up-to-date
      const existing = await KnowledgeItem.findOne({ chunkId: chunk.chunkId });

      if (existing) {
        if (existing.contentHash === contentHash) {
          result.skipped++;
          continue;
        }

        // Content changed, update it
        existing.documentId = chunk.documentId;
        existing.title = chunk.title;
        existing.sourceUrl = chunk.sourceUrl;
        existing.contentType = chunk.contentType;
        existing.roleTags = chunk.roleTags;
        existing.skillTags = chunk.skillTags;
        existing.level = chunk.level;
        existing.prerequisites = chunk.prerequisites;
        existing.content = chunk.content;
        existing.contentHash = contentHash;
        existing.metadata = chunk.metadata ?? {};
        await existing.save();

        result.updated++;
      } else {
        // New chunk, insert
        await KnowledgeItem.create({
          chunkId: chunk.chunkId,
          documentId: chunk.documentId,
          title: chunk.title,
          sourceUrl: chunk.sourceUrl,
          contentType: chunk.contentType,
          roleTags: chunk.roleTags,
          skillTags: chunk.skillTags,
          level: chunk.level,
          prerequisites: chunk.prerequisites,
          content: chunk.content,
          contentHash,
          metadata: chunk.metadata ?? {},
        });

        result.inserted++;
      }
    } catch (err: any) {
      result.errors.push(`Error ingesting ${chunk.chunkId}: ${err?.message || String(err)}`);
    }
  }

  return result;
}
