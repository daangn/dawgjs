export function createDawg(words: readonly string[]): WordGraph {
  return words
    .reduce((builder, word) => builder.add(word), createDawgBuilder())
    .build();
}

export function createDawgBuilder(): WordGraphBuilder {
  return new DawgBuilder();
}

export interface WordGraphBuilder {
  add(word: string): WordGraphBuilder;
  build(): WordGraph;
}

export interface WordGraph {
  readonly wordsCount: number;
  readonly nodesCount: number;
  getPrefixes(input: string): string[];
  has(input: string): boolean;
  getLongestPrefix(input: string): string | undefined;
  getSubstrings(input: string): string[];
}

class Dawg implements WordGraph {

  readonly root: Node;
  readonly wordsCount: number;
  readonly nodesCount: number;

  constructor(builder: DawgBuilder) {
    this.root = builder.root;
    this.wordsCount = builder.root.wordsCount;
    this.nodesCount = builder.minimizedNodes.size;
  }

  has(input: string): boolean {
    let has = false;
    this.traverse(this.root, ({ node, strAcc, index }, next) => {
      if (strAcc === input && node.final) { has = true; } else { next(input[index]); }
    });
    return has;
  }

  getPrefixes(input: string): string[] {
    const prefixes: string[] = [];
    this.traverse(this.root, ({ node, strAcc, index }, next) => {
      if (node.final) { prefixes.push(strAcc); }
      return next(input[index]);
    });
    return prefixes;
  }

  getLongestPrefix(input: string): string | undefined {
    let prefix: string | undefined;
    this.traverse(this.root, ({ node, strAcc, index }, next) => {
      if (node.final) { prefix = strAcc; }
      return next(input[index]);
    });
    return prefix;
  }

  getSubstrings(input: string): string[] {
    const substrings: string[] = [];
    for (let i = 0; i < input.length; i += 1) {
      substrings.push(...this.getPrefixes(input.slice(i)));
    }
    return substrings;
  }

  private traverse(
    from: Node,
    predicate: (
      ctx: {
        node: Node;
        index: number;
        strAcc: string;
      },
      next: (ch?: string) => void
    ) => void,
  ): string {
    let node: Node | undefined = from;
    let strAcc = '';
    let index = 0;
    let ch: string | undefined;
    const next = (nextCh?: string) => {
      ch = nextCh;
    };
    while (node) {
      predicate({ node, index, strAcc }, next);
      if (!ch) { break; }

      node = node.getChild(ch);
      strAcc += ch;
      index += 1;
      ch = undefined;
    }

    return strAcc;
  }

}

class DawgBuilder implements WordGraphBuilder {

  root: Node = new Node();
  prevWord = '';
  uncheckedEdges = [] as Edge[];
  minimizedNodes = new Map<string, Node>();
  wordBuffer: string[] = [];

  add(word: string): this {
    this.wordBuffer.push(word);
    return this;
  }

  build(): WordGraph {
    this.wordBuffer
      .splice(0)
      .filter(word => word.trim() !== '')
      .sort()
      .forEach(word => this.hydrate(word));

    for (const edge of this.uncheckedEdges.splice(0).reverse()) {
      this.minimize(edge);
    }

    this.root.resolve();

    const dawg = new Dawg(this);

    this.clear();

    return dawg;
  }

  clear(): void {
    this.prevWord = '';
    this.uncheckedEdges = [];
    this.minimizedNodes.clear();
    this.wordBuffer = [];
  }

  private hydrate(word: string): this {
    if (word === '') { return this; }

    let prefixLength = 0;
    for (let i = 0; i < word.length; i += 1) {
      if (word[i] !== this.prevWord[i]) { break; }
      prefixLength += 1;
    }

    for (const edge of this.uncheckedEdges.splice(prefixLength).reverse()) {
      this.minimize(edge);
    }

    let node =
      this.uncheckedEdges[this.uncheckedEdges.length - 1]?.child ?? this.root;

    for (let i = prefixLength; i < word.length; i += 1) {
      const child = new Node();
      node.setChild(word[i], child);
      this.uncheckedEdges.push({ parent: node, child, ch: word[i] });
      node = child;
    }

    node.final = true;
    this.prevWord = word;

    return this;
  }

  private minimize(edge: Edge): void {
    const { parent, child, ch } = edge;
    const key = child.createKey();
    const minimizedNode = this.minimizedNodes.get(key);
    if (minimizedNode) { parent.setChild(ch, minimizedNode); } else { this.minimizedNodes.set(key, child); }
  }

}

class Node {

  id: number;
  children = new Map<string, Node>();
  final = false;
  resolved = false;
  wordsCount = 0;

  constructor() {
    this.id = Node.nextId;
    Node.nextId += 1;
  }

  private static nextId = 1;

  getChild(ch: string): Node | undefined {
    return this.children.get(ch);
  }

  setChild(ch: string, node: Node = new Node()): void {
    this.children.set(ch, node);
  }

  createKey(): string {
    let v = '';
    for (const [ch, child] of this.children) {
      v += `_${ch}:${child.id}`;
    }

    if (this.final) { v += '!'; }

    return v;
  }

  resolve(): void {
    if (this.resolved) { return; }

    this.wordsCount = Array.from(this.children).reduce(
      (count, [_, child]) => {
        child.resolve();
        return count + child.wordsCount;
      },
      this.final ? 1 : 0,
    );

    this.resolved = true;
  }

}

type Edge = {
  readonly parent: Node;
  readonly child: Node;
  readonly ch: string;
};
