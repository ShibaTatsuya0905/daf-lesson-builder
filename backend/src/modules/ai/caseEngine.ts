import crypto from 'crypto';
import { ExamSkill } from './examSchema';

export type SituationType =
  | 'planning'
  | 'decision'
  | 'negotiation'
  | 'problem_solving'
  | 'investigation'
  | 'complaint'
  | 'evaluation'
  | 'comparison'
  | 'conflict_resolution'
  | 'resource_allocation'
  | 'policy_design'
  | 'ethical_dilemma'
  | 'research'
  | 'collaboration'
  | 'crisis_management'
  | 'innovation'
  | 'prediction';

export type CaseSelectionVerdict =
  | 'STRONG_CANDIDATE'
  | 'WEAK_DIVERSITY'
  | 'REJECT_DUPLICATE'
  | 'CEFR_VIOLATION'
  | 'INVALID_SCHEMA';

export interface CaseRole {
  role: string;
  motivation: string;
  perspective: string;
  priority: string;
  constraint?: string;
}

export interface CaseConflict {
  type: string;
  stakeholderPositions: Array<{
    role: string;
    position: string;
    reason: string;
  }>;
  dilemma: string;
  tradeOffs: string[];
  compromisePotential?: string;
}

export interface CaseConcreteData {
  location?: string;
  date?: string;
  duration?: string;
  budget?: string;
  quantity?: string;
  statistics?: string[];
  deadline?: string;
  options?: string[];
}

export interface CaseDNA {
  id: string;
  title: string;
  domain: string;
  subdomain: string;
  situationType: SituationType;
  thematicUniverse: string;
  specificContext: string;
  roles: CaseRole[];
  coreConflict: CaseConflict;
  concreteData: CaseConcreteData;
  cefrLevel: string;
  pedagogicalGoal: string;
  generationFingerprint: string;
  semanticFingerprint: string;
  subScenariosBySkill: {
    lesen?: string;
    hoeren?: string;
    schreiben?: string;
    sprechen?: string;
    sprachbausteine?: string;
  };
}

export interface TopicAnalysis {
  rawTopic: string;
  domain: string;
  relatedDomains: string[];
  subdomains: string[];
  commonClichesToAvoid: string[];
  freshAngles: string[];
}

export interface CaseCandidate {
  candidateId: string;
  dna: CaseDNA;
  scores: {
    realism: number;
    novelty: number;
    cefrFit: number;
    pedagogicalValue: number;
    topicRelevance: number;
    total?: number;
  };
  selectionVerdict?: CaseSelectionVerdict;
}

export interface CaseDiscoveryResult {
  topicAnalysis: TopicAnalysis;
  candidates: CaseCandidate[];
}

export interface CaseMemoryEntry {
  id?: string;
  provider: string;
  level: string;
  activeSkills: ExamSkill[];
  topic: string;
  title: string;
  domain: string;
  subdomain: string;
  context: string;
  situationType: string;
  conflictType: string;
  roles: string[];
  location: string;
  options: string;
  fingerprintHash: string;
  semanticFingerprint: string;
  timestamp: number;
}

export class CaseEngine {
  static getLevelConstraints(level: string, provider: string) {
    const cleanLevel = level.toUpperCase();
    const cleanProvider = provider.toUpperCase();

    if (cleanProvider.includes('TESTDAF') || cleanLevel.startsWith('TDN')) {
      if (cleanLevel === 'TDN3') {
        return { minRoles: 2, maxRoles: 4, maxOptions: 4, maxTradeOffs: 3, isAcademic: true };
      }
      if (cleanLevel === 'TDN4') {
        return { minRoles: 3, maxRoles: 5, maxOptions: 5, maxTradeOffs: 4, isAcademic: true };
      }
      return { minRoles: 3, maxRoles: 6, maxOptions: 6, maxTradeOffs: 5, isAcademic: true };
    }

    switch (cleanLevel) {
      case 'A1':
      case 'A2':
        return { minRoles: 2, maxRoles: 3, maxOptions: 3, maxTradeOffs: 2, isAcademic: false };
      case 'B1':
        return { minRoles: 2, maxRoles: 4, maxOptions: 4, maxTradeOffs: 3, isAcademic: false };
      case 'B2':
        return { minRoles: 3, maxRoles: 5, maxOptions: 5, maxTradeOffs: 4, isAcademic: false };
      case 'C1':
      case 'C2':
        return { minRoles: 3, maxRoles: 6, maxOptions: 6, maxTradeOffs: 5, isAcademic: true };
      default:
        return { minRoles: 2, maxRoles: 4, maxOptions: 4, maxTradeOffs: 3, isAcademic: false };
    }
  }

  static validateCaseDNASchema(dna: CaseDNA, level: string): boolean {
    if (!dna || typeof dna !== 'object') return false;
    if (!dna.title || dna.title.trim().length < 5) return false;
    if (!dna.domain || dna.domain.trim().length < 3) return false;
    if (!dna.subdomain || dna.subdomain.trim().length < 3) return false;
    if (!dna.specificContext || dna.specificContext.trim().length < 10) return false;
    if (!dna.thematicUniverse || dna.thematicUniverse.trim().length < 15) return false;
    if (!dna.pedagogicalGoal || dna.pedagogicalGoal.trim().length < 10) return false;

    if (dna.cefrLevel && dna.cefrLevel.toUpperCase() !== level.toUpperCase()) {
      return false;
    }

    const roles = Array.isArray(dna.roles) ? dna.roles : [];
    if (roles.length === 0) return false;

    const hasInvalidRole = roles.some(
      (r) => !r.role || r.role.trim().length === 0 || !r.motivation || r.motivation.trim().length === 0
    );
    if (hasInvalidRole) return false;

    if (!dna.coreConflict || typeof dna.coreConflict !== 'object') return false;
    if (!dna.coreConflict.type || !dna.coreConflict.dilemma || dna.coreConflict.dilemma.trim().length < 10) return false;

    const positions = Array.isArray(dna.coreConflict.stakeholderPositions) ? dna.coreConflict.stakeholderPositions : [];
    if (positions.length < 2) return false;

    const definedRoles = new Set(roles.map((r) => r.role.trim().toLowerCase()));
    const hasUndeclaredStakeholder = positions.some(
      (p) => !p.role || !definedRoles.has(p.role.trim().toLowerCase())
    );
    if (hasUndeclaredStakeholder) return false;

    const uniquePositions = new Set(positions.map((p) => p.position.trim().toLowerCase()));
    if (uniquePositions.size < 2) return false;

    return true;
  }

  static validateCefrFit(dna: CaseDNA, level: string, provider: string, activeSkills: ExamSkill[]): boolean {
    const constraints = this.getLevelConstraints(level, provider);
    const roles = Array.isArray(dna.roles) ? dna.roles : [];
    if (roles.length < constraints.minRoles || roles.length > constraints.maxRoles) return false;

    const tradeOffs = Array.isArray(dna.coreConflict?.tradeOffs) ? dna.coreConflict.tradeOffs : [];
    if (tradeOffs.length > constraints.maxTradeOffs) return false;

    const options = Array.isArray(dna.concreteData?.options) ? dna.concreteData.options : [];
    if (options.length > constraints.maxOptions) return false;

    const subScenarios = dna.subScenariosBySkill || {};
    const hasAllActiveSkills = activeSkills.every((skill) => {
      const key = skill.toLowerCase() as keyof typeof subScenarios;
      return typeof subScenarios[key] === 'string' && (subScenarios[key] as string).trim().length >= 15;
    });

    if (!hasAllActiveSkills) return false;

    return true;
  }

  static normalizeSubScenarios(input: Record<string, string> | undefined): CaseDNA['subScenariosBySkill'] {
    if (!input) return {};
    const normalized: CaseDNA['subScenariosBySkill'] = {};
    for (const [key, value] of Object.entries(input)) {
      const normalizedKey = key.trim().toLowerCase();
      if (
        ['lesen', 'hoeren', 'schreiben', 'sprechen', 'sprachbausteine'].includes(normalizedKey) &&
        typeof value === 'string' &&
        value.trim().length > 0
      ) {
        normalized[normalizedKey as keyof CaseDNA['subScenariosBySkill']] = value.trim();
      }
    }
    return normalized;
  }

  static createSha256Fingerprint(dna: CaseDNA): string {
    const rolesStr = [...(dna.roles || [])].map((r) => r.role).sort().join(',');
    const optionsStr = [...(dna.concreteData?.options || [])].sort().join(',');
    const rawSignature = [
      dna.domain,
      dna.subdomain,
      dna.situationType,
      dna.coreConflict?.type || '',
      rolesStr,
      dna.concreteData?.location || '',
      optionsStr,
      dna.specificContext || '',
    ].map((v) => String(v).trim().toLowerCase()).join('|');

    return crypto.createHash('sha256').update(rawSignature).digest('hex');
  }

  static createSemanticFingerprint(dna: CaseDNA): string {
    const germanStopWords = new Set([
      'der', 'die', 'das', 'des', 'dem', 'den', 'ein', 'eine', 'einer', 'eines', 'einem', 'einen',
      'und', 'oder', 'aber', 'denn', 'doch', 'weil', 'dass', 'da', 'wenn', 'ob', 'als', 'wie',
      'nicht', 'kein', 'keine', 'keinem', 'keinen', 'keiner', 'keines',
      'mit', 'von', 'zu', 'zum', 'zur', 'im', 'in', 'an', 'am', 'auf', 'aus', 'bei', 'nach',
      'ueber', 'über', 'unter', 'vor', 'zwischen', 'durch', 'fuer', 'für', 'um', 'ohne', 'gegen',
      'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'wurde', 'wurden', 'hat', 'haben', 'hatte', 'hatten',
      'sein', 'ihr', 'ihre', 'ihrem', 'ihren', 'ihrer', 'ihres', 'sich', 'er', 'sie', 'es', 'wir', 'man'
    ]);

    const cleanTokens = (text: string) =>
      String(text ?? '')
        .replace(/ä/gi, 'ae')
        .replace(/ö/gi, 'oe')
        .replace(/ü/gi, 'ue')
        .replace(/ß/gi, 'ss')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !germanStopWords.has(w))
        .sort()
        .join(' ');

    const roleTokens = [...(dna.roles || [])]
      .map((r) => cleanTokens(r.role))
      .filter(Boolean)
      .sort()
      .join(',');

    const semanticConcept = [
      cleanTokens(dna.domain),
      cleanTokens(dna.subdomain),
      dna.situationType,
      cleanTokens(dna.coreConflict?.type || ''),
      cleanTokens(dna.coreConflict?.dilemma || ''),
      roleTokens,
    ].join('|');

    return crypto.createHash('sha256').update(semanticConcept).digest('hex');
  }

  static calculatePairwiseDiversity(a: CaseCandidate, b: CaseCandidate): number {
    let diff = 0;
    if (a.dna.situationType !== b.dna.situationType) diff++;
    if (a.dna.domain !== b.dna.domain) diff++;
    if (a.dna.subdomain !== b.dna.subdomain) diff++;
    if (a.dna.coreConflict?.type !== b.dna.coreConflict?.type) diff++;

    const rolesA = [...(a.dna.roles || [])].map((r) => r.role.toLowerCase()).sort().join('|');
    const rolesB = [...(b.dna.roles || [])].map((r) => r.role.toLowerCase()).sort().join('|');
    if (rolesA !== rolesB) diff++;

    const optA = [...(a.dna.concreteData?.options || [])].map((o) => o.toLowerCase()).sort().join('|');
    const optB = [...(b.dna.concreteData?.options || [])].map((o) => o.toLowerCase()).sort().join('|');
    if (optA !== optB) diff++;

    return diff;
  }

  static evaluateCandidateSet(
    candidates: CaseCandidate[],
    memory: CaseMemoryEntry[],
    targetLevel: string,
    provider: string,
    activeSkills: ExamSkill[]
  ): CaseCandidate[] {
    const memoryExactHashes = new Set(memory.map((m) => m.fingerprintHash).filter(Boolean));
    const memorySemanticHashes = new Set(memory.map((m) => m.semanticFingerprint).filter(Boolean));

    const scoredCandidates: CaseCandidate[] = candidates.map((candidate) => {
      const exactHash = this.createSha256Fingerprint(candidate.dna);
      const semanticHash = this.createSemanticFingerprint(candidate.dna);

      const isValidSchema = this.validateCaseDNASchema(candidate.dna, targetLevel);
      const isCefrValid = isValidSchema && this.validateCefrFit(candidate.dna, targetLevel, provider, activeSkills);

      const realism = Math.max(0, Math.min(1, Number(candidate.scores.realism) || 0));
      const novelty = Math.max(0, Math.min(1, Number(candidate.scores.novelty) || 0));
      const cefrFit = isCefrValid ? 1 : 0;
      const pedagogicalValue = Math.max(0, Math.min(1, Number(candidate.scores.pedagogicalValue) || 0));
      const topicRelevance = Math.max(0, Math.min(1, Number(candidate.scores.topicRelevance) || 0));

      let baseTotal = realism + novelty + cefrFit + pedagogicalValue + topicRelevance;
      let verdict: CaseSelectionVerdict = 'STRONG_CANDIDATE';

      if (!isValidSchema) {
        verdict = 'INVALID_SCHEMA';
        baseTotal -= 20;
      } else if (!isCefrValid) {
        verdict = 'CEFR_VIOLATION';
        baseTotal -= 15;
      } else if (memoryExactHashes.has(exactHash) || memorySemanticHashes.has(semanticHash)) {
        verdict = 'REJECT_DUPLICATE';
        baseTotal -= 10;
      }

      return {
        ...candidate,
        dna: {
          ...candidate.dna,
          generationFingerprint: exactHash,
          semanticFingerprint: semanticHash,
        },
        scores: {
          realism,
          novelty,
          cefrFit,
          pedagogicalValue,
          topicRelevance,
          total: Number(baseTotal.toFixed(2)),
        },
        selectionVerdict: verdict,
      };
    });

    const strongCandidates = scoredCandidates
      .filter((c) => c.selectionVerdict === 'STRONG_CANDIDATE')
      .sort((a, b) => (b.scores.total || 0) - (a.scores.total || 0));

    const acceptedPicks: CaseCandidate[] = [];

    strongCandidates.forEach((cand) => {
      let isDiverse = true;
      for (const accepted of acceptedPicks) {
        if (this.calculatePairwiseDiversity(cand, accepted) < 3) {
          isDiverse = false;
          break;
        }
      }

      if (isDiverse) {
        acceptedPicks.push(cand);
      }
    });

    const acceptedIds = new Set(acceptedPicks.map((c) => c.candidateId));

    return scoredCandidates.map((cand) => {
      if (cand.selectionVerdict === 'STRONG_CANDIDATE' && !acceptedIds.has(cand.candidateId)) {
        return {
          ...cand,
          selectionVerdict: 'WEAK_DIVERSITY' as CaseSelectionVerdict,
          scores: {
            ...cand.scores,
            total: Number(((cand.scores.total || 0) - 2.0).toFixed(2)),
          },
        };
      }
      return cand;
    });
  }
}