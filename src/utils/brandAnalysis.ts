/**
 * HS GROUP BRAND VARIANT ANALYZER & DETECTION ENGINE
 * 
 * Mendeteksi 28 brand HS Group secara non-monoton.
 * Membongkar berbagai variasi penulisan SEO phising:
 * - Spacing: "bigo 4d", "bigo 4 d", "bigo-4d", "bigo_4d"
 * - Prefix & Suffix: "login bigo 4d", "bigo 4d login", "daftar bigo 4d", "link alternatif bigo4d"
 * - Root Brand context: "bigo 88", "bigo slot", "bigo togel"
 */

export interface HSBrandDefinition {
  canonical: string;
  displayName: string;
  root: string;
  suffix: string;
}

// 28 Core HS Group Monitored Brands with root and suffix decomposition
export const HS_BRAND_DEFINITIONS: HSBrandDefinition[] = [
  { canonical: 'haes4d', displayName: 'HAES4D', root: 'haes', suffix: '4d' },
  { canonical: 'siritogel', displayName: 'SIRITOGEL', root: 'siri', suffix: 'togel' },
  { canonical: 'tema4d', displayName: 'TEMA4D', root: 'tema', suffix: '4d' },
  { canonical: 'hantogel', displayName: 'HANTOGEL', root: 'han', suffix: 'togel' },
  { canonical: 'ayutogel', displayName: 'AYUTOGEL', root: 'ayu', suffix: 'togel' },
  { canonical: 'bigo4d', displayName: 'BIGO4D', root: 'bigo', suffix: '4d' },
  { canonical: 'tayo4d', displayName: 'TAYO4D', root: 'tayo', suffix: '4d' },
  { canonical: 'djarum4d', displayName: 'DJARUM4D', root: 'djarum', suffix: '4d' },
  { canonical: 'jepe711', displayName: 'JEPE711', root: 'jepe', suffix: '711' },
  { canonical: 'hoki711', displayName: 'HOKI711', root: 'hoki', suffix: '711' },
  { canonical: 'slot711', displayName: 'SLOT711', root: 'slot', suffix: '711' },
  { canonical: 'zeus711', displayName: 'ZEUS711', root: 'zeus', suffix: '711' },
  { canonical: 'ceri711', displayName: 'CERI711', root: 'ceri', suffix: '711' },
  { canonical: 'qris711', displayName: 'QRIS711', root: 'qris', suffix: '711' },
  { canonical: 'horas711', displayName: 'HORAS711', root: 'horas', suffix: '711' },
  { canonical: 'agung711', displayName: 'AGUNG711', root: 'agung', suffix: '711' },
  { canonical: 'sempoa4d', displayName: 'SEMPOA4D', root: 'sempoa', suffix: '4d' },
  { canonical: 'djarum365', displayName: 'DJARUM365', root: 'djarum', suffix: '365' },
  { canonical: 'xiutoto', displayName: 'XIUTOTO', root: 'xiu', suffix: 'toto' },
  { canonical: 'trana4d', displayName: 'TRANA4D', root: 'trana', suffix: '4d' },
  { canonical: 'heng4d', displayName: 'HENG4D', root: 'heng', suffix: '4d' },
  { canonical: 'ronde4d', displayName: 'RONDE4D', root: 'ronde', suffix: '4d' },
  { canonical: 'ragnaroktogel', displayName: 'RAGNAROKTOGEL', root: 'ragnarok', suffix: 'togel' },
  { canonical: 'lumos4d', displayName: 'LUMOS4D', root: 'lumos', suffix: '4d' },
  { canonical: 'senna4d', displayName: 'SENNA4D', root: 'senna', suffix: '4d' },
  { canonical: 'nium889', displayName: 'NIUM889', root: 'nium', suffix: '889' },
  { canonical: 'redana88', displayName: 'REDANA88', root: 'redana', suffix: '88' },
  { canonical: 'blacktogel', displayName: 'BLACKTOGEL', root: 'black', suffix: 'togel' },
];

// Common affixes used in search engine phishing / SEO spam
export const COMMON_PHISHING_AFFIXES = [
  'login', 'daftar', 'link\\s+alternatif', 'alternatif', 'link', 'rtp',
  'situs', 'slot', 'agen', 'bandar', 'apk', 'gacor', 'resmi', 'terpercaya',
  'anti\\s+rungkad', 'hari\\s+ini', 'terbaik', 'bocoran', 'jackpot', 'maxwin', 'vip'
].join('|');

/**
 * Parses any keyword into a brand definition (deconstructing root and suffix).
 */
export function parseBrandKeyword(input: string): HSBrandDefinition {
  const clean = input.trim().toLowerCase();
  
  // 1. Check if it matches known 28 brands
  const existing = HS_BRAND_DEFINITIONS.find(
    b => b.canonical === clean || b.displayName.toLowerCase() === clean
  );
  if (existing) return existing;

  // 2. Check suffix patterns: 4d, 711, 365, 889, 88, togel, toto, slot, bet, etc.
  const suffixMatch = clean.match(/^(.*?)(4d|711|365|889|88|138|777|888|234|togel|toto|slot|bet)$/i);
  if (suffixMatch && suffixMatch[1].length >= 2) {
    return {
      canonical: clean,
      displayName: input.trim().toUpperCase(),
      root: suffixMatch[1],
      suffix: suffixMatch[2]
    };
  }

  // 3. Fallback: single word or custom phrase
  return {
    canonical: clean,
    displayName: input.trim().toUpperCase(),
    root: clean,
    suffix: ''
  };
}

/**
 * Builds a smart regular expression for a brand that detects:
 * - Direct: "bigo4d"
 * - Spaced: "bigo 4d"
 * - Separated: "bigo 4 d", "bigo-4d", "bigo_4d", "bigo.4d"
 * - Affixes: "login bigo 4d", "bigo 4d login", "daftar bigo 4d", "link alternatif bigo4d"
 * - Root in gambling context: "bigo 88", "bigo slot", "bigo 234"
 */
export function buildBrandRegex(brandDef: HSBrandDefinition): RegExp {
  const root = brandDef.root;
  const suffix = brandDef.suffix;

  if (!suffix) {
    // Single-word brand (e.g. "bigo")
    return new RegExp(
      `\\b(?:(?:${COMMON_PHISHING_AFFIXES})[\\s\\-_.]+)?(${root})(?:[\\s\\-_.]+(?:${COMMON_PHISHING_AFFIXES}|\\d{2,4}|4d|togel|toto|slot))?\\b`,
      'gi'
    );
  }

  // Suffix characters with optional separators (e.g. 4[\s\-_.]*d, 7[\s\-_.]*1[\s\-_.]*1)
  const suffixPattern = suffix.split('').join('[\\s\\-_.]*');
  const corePattern = `${root}[\\s\\-_.]*${suffixPattern}`;

  // Affix wrappers around core
  const patternWithAffixes = `(?:(?:${COMMON_PHISHING_AFFIXES})[\\s\\-_.]+)?(?:${corePattern})(?:[\\s\\-_.]+(?:${COMMON_PHISHING_AFFIXES}))?`;

  // Root context for non-generic words (avoid false positives on words like "slot" or "black")
  const genericRoots = ['slot', 'black', 'ayu', 'han'];
  let patternRootContext = '';
  if (!genericRoots.includes(root)) {
    patternRootContext = `|\\b${root}[\\s\\-_.]*(?:${suffixPattern}|login|daftar|link\\s+alternatif|alternatif|link|rtp|slot|togel|toto|gacor)\\b`;
  }

  return new RegExp(`\\b(${patternWithAffixes})${patternRootContext}`, 'gi');
}

export interface BrandSnippetInfo {
  lineNum: number;
  text: string;
  matchedVariant: string;
}

export interface DetectedBrandMatch {
  brand: string;
  canonical: string;
  root: string;
  suffix: string;
  count: number;
  variants: string[];
  lines: number[];
  snippets: BrandSnippetInfo[];
  isManual?: boolean;
}

/**
 * Scans an HTML document for all 28 HS Group brands (plus any manual/custom keywords),
 * decomposing each into rich variants and returning exact line references and snippet previews.
 */
export function scanDocumentForBrands(
  html: string,
  extraKeywords: string[] = [],
  manualKeyword: string = ''
): {
  detectedBrands: DetectedBrandMatch[];
  totalMatches: number;
  highlightMap: Map<number, { brandNames: string[]; variants: string[] }>;
} {
  if (!html) {
    return { detectedBrands: [], totalMatches: 0, highlightMap: new Map() };
  }

  const lines = html.split('\n');
  const detectedBrands: DetectedBrandMatch[] = [];
  const highlightMap = new Map<number, { brandNames: string[]; variants: string[] }>();
  let totalMatches = 0;

  // Build target definitions
  const targets: { def: HSBrandDefinition; isManual: boolean }[] = [];

  // Add manual keyword if provided
  const trimmedManual = manualKeyword.trim();
  if (trimmedManual) {
    targets.push({
      def: parseBrandKeyword(trimmedManual),
      isManual: true
    });
  }

  // Add extra custom keywords
  extraKeywords.forEach(kw => {
    const clean = kw.trim();
    if (clean && !targets.some(t => t.def.canonical === clean.toLowerCase())) {
      targets.push({
        def: parseBrandKeyword(clean),
        isManual: false
      });
    }
  });

  // Ensure all 28 core HS brands are represented
  HS_BRAND_DEFINITIONS.forEach(coreBrand => {
    if (!targets.some(t => t.def.canonical === coreBrand.canonical)) {
      targets.push({
        def: coreBrand,
        isManual: false
      });
    }
  });

  // Execute scan for each target
  targets.forEach(({ def, isManual }) => {
    const regex = buildBrandRegex(def);
    
    // Quick test on entire HTML first
    regex.lastIndex = 0;
    if (!regex.test(html)) {
      return;
    }

    // Line-by-line inspection to record exact line numbers and variants
    let count = 0;
    const matchingLines: number[] = [];
    const snippets: BrandSnippetInfo[] = [];
    const detectedVariantsSet = new Set<string>();

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const lineRegex = buildBrandRegex(def);
      const matches = [...line.matchAll(lineRegex)].map(m => m[0].trim());

      if (matches.length > 0) {
        count += matches.length;
        matchingLines.push(lineNum);

        matches.forEach(m => detectedVariantsSet.add(m));

        if (snippets.length < 8) {
          snippets.push({
            lineNum,
            text: line.trim(),
            matchedVariant: matches[0]
          });
        }

        // Add to line highlight map
        const existing = highlightMap.get(lineNum) || { brandNames: [], variants: [] };
        if (!existing.brandNames.includes(def.displayName)) {
          existing.brandNames.push(def.displayName);
        }
        matches.forEach(m => {
          if (!existing.variants.includes(m)) {
            existing.variants.push(m);
          }
        });
        highlightMap.set(lineNum, existing);
      }
    });

    if (count > 0) {
      totalMatches += count;
      detectedBrands.push({
        brand: def.displayName,
        canonical: def.canonical,
        root: def.root,
        suffix: def.suffix,
        count,
        variants: Array.from(detectedVariantsSet),
        lines: matchingLines,
        snippets,
        isManual
      });
    }
  });

  // Sort: Manual keyword first, then by highest count
  detectedBrands.sort((a, b) => {
    if (a.isManual && !b.isManual) return -1;
    if (!a.isManual && b.isManual) return 1;
    return b.count - a.count;
  });

  return {
    detectedBrands,
    totalMatches,
    highlightMap
  };
}

/**
 * Fast presence check of brands in content for server probes.
 */
export function fastCheckBrands(content: string): string[] {
  if (!content) return [];
  const found: string[] = [];

  for (const def of HS_BRAND_DEFINITIONS) {
    const re = buildBrandRegex(def);
    if (re.test(content)) {
      found.push(def.displayName);
    }
  }

  return found;
}
