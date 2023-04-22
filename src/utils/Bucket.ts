import type { AxiosRequestConfig } from 'axios';

/**
 * @category Utilities
 */
export class Bucket extends Array {
  public processing: ReturnType<typeof setTimeout> | boolean = false;

  public limit: number;

  public remaining: number;

  public reset: number | null = null;

  constructor(limit = 1) {
    super();
    this.limit = limit;
    this.remaining = limit;
  }

  public queue(request: AxiosRequestConfig) {
    this.push(request);
    if (!this.processing) {
      this.processing = true;
      this.execute();
    }
  }

  public execute() {
    if (!this.length) {
      if (typeof this.processing === 'number') clearTimeout(this.processing);
      this.processing = false;
      return;
    }

    const now = Date.now();
    if (!this.reset || this.reset < now) {
      this.reset = now;
      this.remaining = this.limit;
    }

    if (this.remaining <= 0) {
      this.processing = setTimeout(
        () => this.execute(),
        Math.max(0, (this.reset || 0) - now),
      );
      return;
    }

    --this.remaining;

    this.shift()(() => this.execute());
  }
}
