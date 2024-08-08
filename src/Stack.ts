export class Stack {
  bottom: Stack | null;
  top: Stack | null;

  constructor(readonly name: string) {
    this.top = null;
    this.bottom = null;
  }

  get topMost(): Stack {
    return this.top ? this.top.topMost : this;
  }

  get bottomMost(): Stack {
    return this.bottom ? this.bottom.bottomMost : this;
  }

  toArray(): string[] {
    return [this.name, ...(this.top?.toArray() ?? [])];
  }

  iterate(callback: (name: string) => void) {
    callback(this.name);
    this.bottom?.iterate(callback);
  }
}
