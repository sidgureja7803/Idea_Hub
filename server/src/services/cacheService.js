import { createClient } from 'redis';
import crypto from 'crypto';

class CacheService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.ttl = parseInt(process.env.RESEARCH_CACHE_TTL || '259200');
  }

  async connect() {
    if (this.connected) return;
    try {
      this.client = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        },
        password: process.env.REDIS_PASSWORD || undefined
      });
      await this.client.connect();
      this.connected = true;
      console.log('[Cache] Redis connected');
    } catch (error) {
      console.warn('[Cache] Redis connection failed:', error.message);
      this.connected = false;
    }
  }

  generateResearchHash(ideaId, queries) {
    const data = `${ideaId}:${queries.sort().join('|')}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  getCacheKey(ideaId, researchHash) {
    return `research:${ideaId}:${researchHash}`;
  }

  async get(ideaId, researchHash) {
    if (!this.connected) return null;
    try {
      const key = this.getCacheKey(ideaId, researchHash);
      const data = await this.client.get(key);
      if (data) {
        console.log(`[Cache] HIT: ${key}`);
        return JSON.parse(data);
      }
      console.log(`[Cache] MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('[Cache] Get error:', error.message);
      return null;
    }
  }

  async set(ideaId, researchHash, data) {
    if (!this.connected) return false;
    try {
      const key = this.getCacheKey(ideaId, researchHash);
      await this.client.setEx(key, this.ttl, JSON.stringify(data));
      console.log(`[Cache] SET: ${key} (TTL: ${this.ttl}s)`);
      return true;
    } catch (error) {
      console.error('[Cache] Set error:', error.message);
      return false;
    }
  }

  async invalidate(ideaId) {
    if (!this.connected) return false;
    try {
      const pattern = `research:${ideaId}:*`;
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`[Cache] Invalidated ${keys.length} keys for ${ideaId}`);
      }
      return true;
    } catch (error) {
      console.error('[Cache] Invalidate error:', error.message);
      return false;
    }
  }
}

export default new CacheService();
