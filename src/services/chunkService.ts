// Chunking Service - Recursive splitting of large diffs with context management

import { ChunkInfo, ProjectConfig } from '../types/analysis';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CONFIG } from '../graph/workflow';

interface ChunkingConfig {
  maxTokens: number;
  overlapLines: number;
  minChunkSize: number;
  contextLines: number;
}

export class ChunkService {
  private config: ChunkingConfig;

  constructor(projectConfig: Partial<ProjectConfig>) {
    this.config = {
      maxTokens: projectConfig.max_chunk_tokens || DEFAULT_CONFIG.project.max_chunk_tokens,
      overlapLines: 3,
      minChunkSize: 50, // Minimum lines per chunk
      contextLines: projectConfig.context_lines || DEFAULT_CONFIG.project.context_lines
    };
    
    console.log(chalk.blue(`🧩 Chunk service configured:`));
    console.log(chalk.gray(`   Max tokens: ${this.config.maxTokens}`));
    console.log(chalk.gray(`   Context lines: ${this.config.contextLines}`));
    console.log(chalk.gray(`   Overlap lines: ${this.config.overlapLines}`));
  }

  /**
   * Split a file diff into manageable chunks
   */
  async chunkFileDiff(filePath: string, diffContent: string): Promise<ChunkInfo[]> {
    console.log(chalk.blue(`\n🧩 Chunking file: ${chalk.yellow(filePath)}`));
    console.log(chalk.gray(`📄 Diff size: ${diffContent.length} characters`));
    
    // Estimate token count (rough approximation: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(diffContent.length / 4);
    console.log(chalk.gray(`🔢 Estimated tokens: ${estimatedTokens}`));
    
    // If the diff is small enough, return as single chunk
    if (estimatedTokens <= this.config.maxTokens) {
      console.log(chalk.green(`✅ File fits in single chunk`));
      return [{
        id: uuidv4(),
        file_path: filePath,
        size_tokens: estimatedTokens,
        diff_content: diffContent,
        is_complete_file: true
      }];
    }
    
    console.log(chalk.yellow(`⚠️  File too large, splitting into chunks...`));
    
    // Parse diff to understand structure
    const diffStructure = this.parseDiffStructure(diffContent);
    
    // Split based on diff structure
    const chunks = this.createChunksFromDiff(filePath, diffStructure);
    
    console.log(chalk.green(`✅ Created ${chunks.length} chunks for ${filePath}`));
    chunks.forEach((chunk, index) => {
      console.log(chalk.gray(`   ${index + 1}. Chunk ${chunk.id.slice(0, 8)} (${chunk.size_tokens} tokens)`));
    });
    
    return chunks;
  }

  /**
   * Parse diff structure to identify logical boundaries
   */
  private parseDiffStructure(diffContent: string): DiffStructure {
    const lines = diffContent.split('\n');
    const hunks: DiffHunk[] = [];
    let currentHunk: DiffHunk | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect hunk headers (@@)
      if (line.startsWith('@@')) {
        if (currentHunk) {
          hunks.push(currentHunk);
        }
        
        const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
        if (match) {
          currentHunk = {
            header: line,
            oldStart: parseInt(match[1]),
            oldLines: parseInt(match[2]) || 1,
            newStart: parseInt(match[3]),
            newLines: parseInt(match[4]) || 1,
            lines: [],
            startIndex: i
          };
        }
      } else if (currentHunk) {
        currentHunk.lines.push({
          content: line,
          type: line.startsWith('+') ? 'addition' : 
                line.startsWith('-') ? 'deletion' : 'context',
          lineNumber: i
        });
      }
    }
    
    if (currentHunk) {
      hunks.push(currentHunk);
    }
    
    return {
      hunks,
      totalLines: lines.length,
      fullContent: diffContent
    };
  }

  /**
   * Create chunks from parsed diff structure
   */
  private createChunksFromDiff(filePath: string, diffStructure: DiffStructure): ChunkInfo[] {
    const chunks: ChunkInfo[] = [];
    
    // If only one hunk and it's small enough, keep as one chunk
    if (diffStructure.hunks.length === 1) {
      const hunk = diffStructure.hunks[0];
      const chunkContent = this.reconstructHunkContent(hunk);
      const tokens = Math.ceil(chunkContent.length / 4);
      
      if (tokens <= this.config.maxTokens) {
        return [{
          id: uuidv4(),
          file_path: filePath,
          start_line: hunk.newStart,
          end_line: hunk.newStart + hunk.newLines - 1,
          size_tokens: tokens,
          diff_content: chunkContent,
          is_complete_file: false
        }];
      }
    }
    
    // Split hunks into smaller chunks if needed
    for (const hunk of diffStructure.hunks) {
      const hunkChunks = this.splitHunkIfNeeded(filePath, hunk);
      chunks.push(...hunkChunks);
    }
    
    // Add context between chunks if they're from the same file
    return this.addContextBetweenChunks(chunks);
  }

  /**
   * Split a single hunk if it's too large
   */
  private splitHunkIfNeeded(filePath: string, hunk: DiffHunk): ChunkInfo[] {
    const hunkContent = this.reconstructHunkContent(hunk);
    const tokens = Math.ceil(hunkContent.length / 4);
    
    if (tokens <= this.config.maxTokens) {
      // Hunk fits in one chunk
      return [{
        id: uuidv4(),
        file_path: filePath,
        start_line: hunk.newStart,
        end_line: hunk.newStart + hunk.newLines - 1,
        size_tokens: tokens,
        diff_content: hunkContent,
        is_complete_file: false
      }];
    }
    
    // Split hunk into smaller pieces
    const chunks: ChunkInfo[] = [];
    const linesPerChunk = Math.floor(this.config.maxTokens / (hunkContent.length / hunk.lines.length * 4));
    const minLines = Math.max(this.config.minChunkSize, linesPerChunk);
    
    for (let i = 0; i < hunk.lines.length; i += minLines) {
      const endIndex = Math.min(i + minLines + this.config.overlapLines, hunk.lines.length);
      const chunkLines = hunk.lines.slice(i, endIndex);
      
      const chunkContent = hunk.header + '\n' + chunkLines.map(l => l.content).join('\n');
      const chunkTokens = Math.ceil(chunkContent.length / 4);
      
      chunks.push({
        id: uuidv4(),
        file_path: filePath,
        start_line: hunk.newStart + i,
        end_line: hunk.newStart + endIndex - 1,
        size_tokens: chunkTokens,
        diff_content: chunkContent,
        is_complete_file: false
      });
    }
    
    return chunks;
  }

  /**
   * Add context information between chunks
   */
  private addContextBetweenChunks(chunks: ChunkInfo[]): ChunkInfo[] {
    if (chunks.length <= 1) return chunks;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Add context from previous chunk
      if (i > 0) {
        const prevChunk = chunks[i - 1];
        const contextLines = this.extractContextLines(prevChunk.diff_content, -this.config.contextLines);
        if (contextLines) {
          chunk.context_before = `Previous chunk context:\n${contextLines}`;
        }
      }
      
      // Add context to next chunk
      if (i < chunks.length - 1) {
        const nextChunk = chunks[i + 1];
        const contextLines = this.extractContextLines(chunk.diff_content, this.config.contextLines);
        if (contextLines) {
          nextChunk.context_after = `Next chunk context:\n${contextLines}`;
        }
      }
    }
    
    return chunks;
  }

  /**
   * Extract context lines from chunk content
   */
  private extractContextLines(content: string, lineCount: number): string | null {
    const lines = content.split('\n').filter(line => !line.startsWith('@@'));
    
    if (lineCount > 0) {
      // Take last N lines
      return lines.slice(-lineCount).join('\n');
    } else {
      // Take first N lines
      return lines.slice(0, Math.abs(lineCount)).join('\n');
    }
  }

  /**
   * Reconstruct content from hunk
   */
  private reconstructHunkContent(hunk: DiffHunk): string {
    return hunk.header + '\n' + hunk.lines.map(l => l.content).join('\n');
  }

  /**
   * Estimate total tokens for a file diff
   */
  estimateTokens(content: string): number {
    return Math.ceil(content.length / 4);
  }

  /**
   * Check if content needs chunking
   */
  needsChunking(content: string): boolean {
    return this.estimateTokens(content) > this.config.maxTokens;
  }
}

// Supporting interfaces
interface DiffStructure {
  hunks: DiffHunk[];
  totalLines: number;
  fullContent: string;
}

interface DiffHunk {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
  startIndex: number;
}

interface DiffLine {
  content: string;
  type: 'addition' | 'deletion' | 'context';
  lineNumber: number;
} 
