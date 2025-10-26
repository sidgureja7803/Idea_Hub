export class DedupeRanker {
  canonicalizeUrl(url) {
    try {
      const u = new URL(url);
      u.hostname = u.hostname.replace(/^www\./, '');
      u.hash = '';
      if (u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1);
      u.search = Array.from(new URLSearchParams(u.search).entries())
        .filter(([k]) => !['utm_source', 'utm_medium', 'utm_campaign'].includes(k))
        .sort().map(([k, v]) => `${k}=${v}`).join('&');
      return u.toString();
    } catch { return url; }
  }

  deduplicate(documents) {
    const seen = { urls: new Set(), hashes: new Set() };
    return documents.filter(doc => {
      const canonUrl = this.canonicalizeUrl(doc.url);
      if (seen.urls.has(canonUrl)) return false;
      if (doc.contentHash && seen.hashes.has(doc.contentHash)) return false;
      seen.urls.add(canonUrl);
      if (doc.contentHash) seen.hashes.add(doc.contentHash);
      return true;
    });
  }

  rank(documents, queries = []) {
    return documents.map(doc => ({
      ...doc,
      rankScore: this.calculateScore(doc, queries)
    })).sort((a, b) => b.rankScore - a.rankScore);
  }

  calculateScore(doc, queries) {
    let score = 0;
    score += this.recencyScore(doc.metadata?.publishedDate || doc.metadata?.fetchedAt);
    score += this.domainAuthorityScore(doc.metadata?.domain);
    score += this.queryOverlapScore(doc.content, queries);
    return score;
  }

  recencyScore(date) {
    if (!date) return 0;
    const d = new Date(date);
    const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (age < 30) return 10;
    if (age < 90) return 7;
    if (age < 180) return 5;
    if (age < 365) return 3;
    return 1;
  }

  domainAuthorityScore(domain) {
    const high = ['wikipedia.org', 'reuters.com', 'bloomberg.com', 'forbes.com', 'wsj.com', 'nytimes.com'];
    const med = ['techcrunch.com', 'venturebeat.com', 'medium.com', 'github.com'];
    if (high.includes(domain)) return 10;
    if (med.includes(domain)) return 5;
    if (domain?.endsWith('.gov') || domain?.endsWith('.edu')) return 8;
    return 3;
  }

  queryOverlapScore(content, queries) {
    if (!content || !queries.length) return 0;
    const lower = content.toLowerCase();
    const matches = queries.filter(q => lower.includes(q.toLowerCase()));
    return matches.length * 5;
  }
}

export default DedupeRanker;
