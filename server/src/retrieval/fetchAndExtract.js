import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import pdfParse from 'pdf-parse';
import crypto from 'crypto';
import Bottleneck from 'bottleneck';
import robotsParser from 'robots-parser';

export class ContentFetcher {
  constructor() {
    const rateLimit = parseInt(process.env.FETCH_RATE_LIMIT || '20');
    this.limiter = new Bottleneck({
      minTime: Math.ceil(60000 / rateLimit),
      maxConcurrent: 3
    });
    this.timeout = parseInt(process.env.RESEARCH_FETCH_TIMEOUT || '30000');
    this.userAgent = 'IdeaHub Research Bot/1.0';
    this.client = axios.create({
      timeout: this.timeout,
      maxRedirects: 5,
      headers: { 'User-Agent': this.userAgent }
    });
    this.robotsCache = new Map();
  }

  async checkRobotsTxt(url) {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      if (this.robotsCache.has(urlObj.host)) {
        return this.robotsCache.get(urlObj.host).isAllowed(url, this.userAgent);
      }
      const response = await axios.get(robotsUrl, { timeout: 5000, validateStatus: s => s < 500 });
      const robots = robotsParser(robotsUrl, response.status === 200 ? response.data : '');
      this.robotsCache.set(urlObj.host, robots);
      setTimeout(() => this.robotsCache.delete(urlObj.host), 3600000);
      return robots.isAllowed(url, this.userAgent);
    } catch (error) {
      return true;
    }
  }

  async fetchAndExtract(url) {
    try {
      const allowed = await this.checkRobotsTxt(url);
      if (!allowed) {
        return { url, title: 'Blocked', content: '', contentHash: null, 
          metadata: { blocked: true, domain: new URL(url).hostname, fetchedAt: new Date() }};
      }
      const response = await this.limiter.schedule(() => this.client.get(url, { responseType: 'arraybuffer' }));
      const contentType = response.headers['content-type'] || '';
      return contentType.includes('pdf') ? await this.extractPDF(url, response.data) : await this.extractHTML(url, response.data);
    } catch (error) {
      return { url, title: 'Failed', content: '', contentHash: null, 
        metadata: { error: true, errorMessage: error.message, fetchedAt: new Date() }};
    }
  }

  async extractHTML(url, data) {
    const html = data.toString('utf-8');
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse() || { title: 'Untitled', textContent: dom.window.document.body?.textContent || '' };
    const clean = this.normalizeWhitespace(article.textContent).substring(0, 50000);
    return { url, title: article.title, content: clean, contentHash: this.computeHash(clean),
      metadata: { domain: this._extractDomain(url), fetchedAt: new Date() }};
  }

  async extractPDF(url, data) {
    const pdf = await pdfParse(data);
    const clean = this.normalizeWhitespace(pdf.text).substring(0, 50000);
    return { url, title: pdf.info?.Title || 'PDF Document', content: clean, contentHash: this.computeHash(clean),
      metadata: { domain: this._extractDomain(url), pages: pdf.numpages, fetchedAt: new Date() }};
  }

  normalizeWhitespace(text) {
    return text ? text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ')
      .replace(/ +/g, ' ').replace(/\n +/g, '\n').replace(/ +\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() : '';
  }

  computeHash(content) {
    return content ? crypto.createHash('sha256').update(content).digest('hex') : null;
  }

  _extractDomain(url) {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return 'unknown'; }
  }
}

export default ContentFetcher;
