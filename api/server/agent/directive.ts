import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);

interface Directive {
  conversationId: string;
  systemPrompt: string;
  personality?: string;
  memoryPolicy?: string;
  lastUpdated: number;
}

interface DirectiveHistory {
  [conversationId: string]: Directive[];
}

class DirectiveStore {
  private storePath: string;
  private tempPath: string;
  private historyPath: string;
  private cache: { [conversationId: string]: Directive } = {};
  private historyCache: DirectiveHistory | null = null;

  constructor(storagePath?: string) {
    const baseDir = storagePath || path.join(process.cwd(), 'data', 'directives');
    this.storePath = path.join(baseDir, 'directives.json');
    this.tempPath = path.join(baseDir, 'directives.json.tmp');
    this.historyPath = path.join(baseDir, 'directive-history.json');
    this.ensureDirectory(baseDir);
  }

  private ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Load directives from disk
   */
  private async loadDirectives(): Promise<{ [conversationId: string]: Directive }> {
    try {
      if (!fs.existsSync(this.storePath)) {
        return {};
      }

      const data = await readFile(this.storePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('[DirectiveStore] Error loading directives:', error);
      return {};
    }
  }

  /**
   * Load directive history from disk
   */
  private async loadHistory(): Promise<DirectiveHistory> {
    if (this.historyCache) {
      return this.historyCache;
    }

    try {
      if (!fs.existsSync(this.historyPath)) {
        this.historyCache = {};
        return this.historyCache;
      }

      const data = await readFile(this.historyPath, 'utf-8');
      this.historyCache = JSON.parse(data);
      return this.historyCache;
    } catch (error) {
      console.error('[DirectiveStore] Error loading directive history:', error);
      this.historyCache = {};
      return this.historyCache;
    }
  }

  /**
   * Save directives to disk with atomic write
   */
  private async saveDirectives(directives: { [conversationId: string]: Directive }): Promise<void> {
    try {
      await writeFile(this.tempPath, JSON.stringify(directives, null, 2), 'utf-8');
      await rename(this.tempPath, this.storePath);
      this.cache = directives;
    } catch (error) {
      console.error('[DirectiveStore] Error saving directives:', error);
      
      try {
        if (fs.existsSync(this.tempPath)) {
          await unlink(this.tempPath);
        }
      } catch (cleanupError) {
        console.error('[DirectiveStore] Error cleaning up temp file:', cleanupError);
      }
      
      throw error;
    }
  }

  /**
   * Save directive history to disk
   */
  private async saveHistory(history: DirectiveHistory): Promise<void> {
    try {
      const tempHistoryPath = `${this.historyPath}.tmp`;
      await writeFile(tempHistoryPath, JSON.stringify(history, null, 2), 'utf-8');
      await rename(tempHistoryPath, this.historyPath);
      this.historyCache = history;
    } catch (error) {
      console.error('[DirectiveStore] Error saving directive history:', error);
      throw error;
    }
  }

  /**
   * Get directive for a conversation
   */
  async getDirective(conversationId: string): Promise<Directive | null> {
    const directives = await this.loadDirectives();
    return directives[conversationId] || null;
  }

  /**
   * Save or update directive for a conversation
   */
  async saveDirective(
    conversationId: string,
    systemPrompt: string,
    personality?: string,
    memoryPolicy?: string,
  ): Promise<Directive> {
    const directives = await this.loadDirectives();
    const history = await this.loadHistory();

    const directive: Directive = {
      conversationId,
      systemPrompt,
      personality,
      memoryPolicy,
      lastUpdated: Date.now(),
    };

    // Save current directive to history
    if (directives[conversationId]) {
      if (!history[conversationId]) {
        history[conversationId] = [];
      }
      history[conversationId].push(directives[conversationId]);
      
      // Keep only last 10 history items per conversation
      if (history[conversationId].length > 10) {
        history[conversationId] = history[conversationId].slice(-10);
      }
      
      await this.saveHistory(history);
    }

    directives[conversationId] = directive;
    await this.saveDirectives(directives);
    
    return directive;
  }

  /**
   * Get directive history for a conversation
   */
  async getDirectiveHistory(conversationId: string): Promise<Directive[]> {
    const history = await this.loadHistory();
    return history[conversationId] || [];
  }

  /**
   * Delete directive for a conversation
   */
  async deleteDirective(conversationId: string): Promise<boolean> {
    const directives = await this.loadDirectives();
    
    if (!directives[conversationId]) {
      return false;
    }

    delete directives[conversationId];
    await this.saveDirectives(directives);
    return true;
  }

  /**
   * Get all presets (directives that can be reused)
   * For now, we'll just return the unique directives from history
   */
  async getPresets(): Promise<Directive[]> {
    const history = await this.loadHistory();
    const presets: Directive[] = [];
    const seen = new Set<string>();

    Object.values(history).forEach((conversationHistory) => {
      conversationHistory.forEach((directive) => {
        const key = `${directive.systemPrompt}_${directive.personality}_${directive.memoryPolicy}`;
        if (!seen.has(key)) {
          seen.add(key);
          presets.push(directive);
        }
      });
    });

    return presets;
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    this.cache = {};
    this.historyCache = null;
  }
}

// Export singleton instance
export const directiveStore = new DirectiveStore();

export type { Directive, DirectiveHistory };
export default DirectiveStore;
