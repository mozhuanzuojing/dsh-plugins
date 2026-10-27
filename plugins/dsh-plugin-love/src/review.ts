import { DIMENSION_IDS, DEFAULT_LIMITS, REVIEW_FORMAT, RULES_VERSION, SEVERITY_ORDER } from './constants.ts';
import { analyzeInventory, computeBudget } from './analyze.ts';
import { checksFor } from './checks.ts';
import { composeReview } from './compose.ts';
import { buildStrengths, manualChecks, scoreFindings, topFixes } from './score.ts';
import { resolveTarget, walkPlugin, dshHome } from './scan.ts';
import { newReviewId, saveReview } from './store.ts';
import { uniqueBy } from './util.ts';

const VALID_DIMENSIONS = new Set(DIMENSION_IDS);
const VALID_DEPTHS = new Set(['quick', 'standard', 'deep']);

export function normalizeOptions(options: any = {}) {
  const depth = VALID_DEPTHS.has(options.depth) ? options.depth : 'standard';
  const lang = options.lang === 'en' ? 'en' : 'zh';
  const focus = Array.isArray(options.focus)
    ? [...new Set(options.focus.filter((item) => VALID_DIMENSIONS.has(item)))]
    : [];
  return { depth, lang, focus };
}

function highestSeverity(values) {
  let best = 'P3';
  for (const value of values) {
    if (SEVERITY_ORDER.indexOf(value) < SEVERITY_ORDER.indexOf(best)) best = value;
  }
  return best;
}

function targetView(target) {
  return {
    name: target.name,
    version: target.version,
    description: target.description,
    title: target.title,
    path: target.root,
    kind: target.kind,
    source: target.source,
  };
}

/**
 * Run a full review. This is the single implementation shared by the agent
 * tool and the HTTP route.
 */
export async function reviewTarget(input: string, options: any = {}): Promise<any> {
  const { depth, lang, focus } = normalizeOptions(options);
  const config = options.config && typeof options.config === 'object' ? options.config : {};
  const limits = {
    ...DEFAULT_LIMITS,
    ...config,
    deadlineMs: (config.deadlineMs && config.deadlineMs[depth]) || DEFAULT_LIMITS.deadlineMs[depth],
  };
  const target = await resolveTarget(input, {});
  const inventory = await walkPlugin(target.root, limits);
  const analysis = await analyzeInventory(inventory, target);
  const budget = computeBudget(inventory);

  const ctx = { inventory, target, analysis, budget };
  const findings = [];
  const detectorErrors = [];
  for (const check of checksFor({ depth, focus })) {
    let occurrences = [];
    try {
      occurrences = check.detect(ctx) || [];
    } catch (error) {
      detectorErrors.push({ checkId: check.id, message: error && error.message ? error.message : String(error) });
      continue;
    }
    occurrences = uniqueBy(
      occurrences.filter((item) => item && item.path),
      (item) => `${item.path}:${item.line}:${item.detail || ''}`,
    );
    if (occurrences.length === 0) continue;
    findings.push({
      id: check.id,
      checkId: check.id,
      dimension: check.dimension,
      tier: check.tier,
      severity: highestSeverity(occurrences.map((item) => item.severity || check.severity)),
      confidence: check.confidence,
      occurrences: occurrences.slice(0, 10),
      totalOccurrences: occurrences.length,
    });
  }

  findings.sort((a, b) => {
    const sev = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    if (sev !== 0) return sev;
    return a.checkId.localeCompare(b.checkId);
  });
  const limitedFindings = findings.slice(0, limits.maxFindings || DEFAULT_LIMITS.maxFindings);
  const includedDimensions = focus.length ? focus : DIMENSION_IDS;
  const score = scoreFindings(limitedFindings, includedDimensions);
  const strengths = buildStrengths(inventory, analysis, limitedFindings, budget);
  const top = topFixes(limitedFindings);
  const manual = manualChecks(inventory, limitedFindings);

  const generatedSkipped = inventory.files
    .filter((file) => file.generated)
    .map((file) => ({ path: file.path, reason: file.skipReason || 'generated-bundle' }));
  const skipped = [...inventory.skipped, ...generatedSkipped].slice(0, 40);
  const reviewedFiles = inventory.files.filter((file) => !file.generated).length;
  const coverage = {
    reviewedFiles,
    totalLines: inventory.files.filter((file) => !file.generated).reduce((sum, file) => sum + file.lineCount, 0),
    skipped,
    partial: inventory.partial,
    confidence: reviewedFiles === 0 ? 'low' : inventory.partial ? 'medium' : 'high',
    notRun: ['runtime profiling', 'Lighthouse', 'real network timing', 'memory'],
    detectorErrors,
  };

  const scan: Record<string, any> = {
    format: REVIEW_FORMAT,
    rulesVersion: RULES_VERSION,
    id: newReviewId(target),
    createdAt: new Date().toISOString(),
    depth,
    homeDir: dshHome(),
    target: targetView(target),
    rawFindings: limitedFindings.map((finding) => ({
      id: finding.id,
      checkId: finding.checkId,
      dimension: finding.dimension,
      tier: finding.tier,
      severity: finding.severity,
      confidence: finding.confidence,
      occurrences: finding.occurrences,
    })),
    score,
    strengths,
    topFixes: top,
    manualChecks: manual,
    budget,
    coverage,
    persisted: true,
  };

  if (options.persist !== false) {
    try {
      await saveReview(scan);
    } catch (error) {
      scan.persisted = false;
      scan.persistError = error && error.message ? error.message : String(error);
    }
  } else {
    scan.persisted = false;
  }

  const review = composeReview(scan, lang);
  review.persisted = scan.persisted;
  if (scan.persistError) review.persistError = scan.persistError;
  return review;
}

export async function reviewFromInput(input: string, options: any = {}) {
  return reviewTarget(input, options);
}
