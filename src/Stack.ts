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

  iterate(callback: (stack: Stack) => void, toTop?: boolean) {
    callback(this);
    if (!toTop) this.bottom?.iterate(callback);
    else this.top?.iterate(callback, toTop);
  }

  cloneFromBottom() {
    const arr: string[] = [];
    this.topMost.iterate(({ name }) => {
      arr.push(name);
    });
    arr.reverse();

    const stacks = arr.map((name) => new Stack(name));
    stacks.forEach((stack, i, arr) => {
      if (i - 1 >= 0) stack.bottom = arr[i - 1];
      if (i + 1 < arr.length) stack.top = arr[i + 1];
    });

    return stacks[0];
  }
}
