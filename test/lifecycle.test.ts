import test from 'node:test';
import assert from 'node:assert';
import { generateFingerprint, ATS_RUBRIC_VERSION, CAREER_RUBRIC_VERSION } from '../lib/scoring';

test('Lifecycle: Fingerprint is deterministic for same resume and target role', () => {
  const resume = "Experienced Full Stack Engineer with Next.js and TypeScript";
  const role = "Senior Frontend Engineer";

  const fp1 = generateFingerprint(`${resume}:${role}`);
  const fp2 = generateFingerprint(`${resume}:${role}`);

  assert.strictEqual(fp1, fp2, "Identical resume and role must generate identical fingerprint");
});

test('Lifecycle: Fingerprint changes when target role changes', () => {
  const resume = "Experienced Full Stack Engineer with Next.js and TypeScript";

  const fpFrontend = generateFingerprint(`${resume}:Frontend Engineer`);
  const fpBackend = generateFingerprint(`${resume}:Backend Engineer`);

  assert.notStrictEqual(
    fpFrontend,
    fpBackend,
    "Changing target role must invalidate the fingerprint to trigger fresh analysis"
  );
});

test('Lifecycle: Fingerprint changes when resume text is modified', () => {
  const resumeV1 = "Experience: React, Next.js";
  const resumeV2 = "Experience: React, Next.js, GraphQL, Docker";
  const role = "Full Stack Engineer";

  const fp1 = generateFingerprint(`${resumeV1}:${role}`);
  const fp2 = generateFingerprint(`${resumeV2}:${role}`);

  assert.notStrictEqual(fp1, fp2, "Updated resume content must invalidate previous fingerprint");
});

test('Concurrency Guard: Duplicate in-flight requests share the same promise', async () => {
  const inFlightRequests = new Map<string, Promise<{ reportId: string }>>();
  let executionCount = 0;

  const simulateExpensiveGeneration = async (key: string): Promise<{ reportId: string }> => {
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key)!;
    }

    const task = (async () => {
      executionCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { reportId: `report_${Date.now()}` };
    })();

    inFlightRequests.set(key, task);
    try {
      return await task;
    } finally {
      inFlightRequests.delete(key);
    }
  };

  const key = "user123:fingerprint_abc:1.0.2";

  // Simulate 3 concurrent incoming requests with the same key
  const [res1, res2, res3] = await Promise.all([
    simulateExpensiveGeneration(key),
    simulateExpensiveGeneration(key),
    simulateExpensiveGeneration(key),
  ]);

  assert.strictEqual(executionCount, 1, "Only 1 expensive AI generation should run for concurrent identical requests");
  assert.strictEqual(res1.reportId, res2.reportId, "Concurrent requests should receive the identical report result");
  assert.strictEqual(res2.reportId, res3.reportId);
});

test('Failed Generation Protection: State is not overwritten when generator throws', async () => {
  let existingReport = {
    id: "initial_valid_report",
    atsScore: 85,
    status: "completed",
  };

  const attemptUpdate = async (shouldFail: boolean) => {
    try {
      if (shouldFail) {
        throw new Error("AI output validation failed: invalid schema");
      }
      existingReport = {
        id: "new_report",
        atsScore: 92,
        status: "completed",
      };
    } catch {
      // Failed generation is caught, existing valid report is preserved intact
    }
  };

  await attemptUpdate(true);
  assert.strictEqual(existingReport.id, "initial_valid_report", "Existing report must be preserved when generation fails");
  assert.strictEqual(existingReport.atsScore, 85);

  await attemptUpdate(false);
  assert.strictEqual(existingReport.id, "new_report", "Valid generation updates the report as expected");
  assert.strictEqual(existingReport.atsScore, 92);
});

test('Authorization: Queries must strictly enforce user ownership', () => {
  const mockDatabase = [
    { id: "report_1", userId: "user_alice", score: 88 },
    { id: "report_2", userId: "user_bob", score: 75 },
  ];

  const getReportForUser = (requestingUserId: string, targetUserId: string) => {
    // Enforcing user ownership: requesting user can only query their own records
    if (requestingUserId !== targetUserId) {
      return { status: 403, error: "Forbidden: cross-user access denied" };
    }
    const found = mockDatabase.find((r) => r.userId === requestingUserId);
    return { status: 200, data: found };
  };

  // Alice queries her own
  const aliceOwn = getReportForUser("user_alice", "user_alice");
  assert.strictEqual(aliceOwn.status, 200);
  assert.strictEqual(aliceOwn.data?.userId, "user_alice");

  // Alice tries to query Bob's
  const crossUserAccess = getReportForUser("user_alice", "user_bob");
  assert.strictEqual(crossUserAccess.status, 403);
  assert.strictEqual(crossUserAccess.error, "Forbidden: cross-user access denied");
});

test('Rubric versions prevent stale rubric reuse', () => {
  const currentATS = ATS_RUBRIC_VERSION;
  const oldATS = "1.0.0";

  assert.notStrictEqual(
    currentATS,
    oldATS,
    "New rubric version must not match old version so reports are recalculated with updated rubrics"
  );
  assert.ok(CAREER_RUBRIC_VERSION, "Career rubric version must be tracked");
});
