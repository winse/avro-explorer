export class Logger {
  private static prefix = '[avro-explorer]';

  static info(message: string, ...args: any[]): void {
    console.log(`${this.prefix} INFO: ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} WARN: ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} ERROR: ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    if (process.env.DEBUG) {
      console.debug(`${this.prefix} DEBUG: ${message}`, ...args);
    }
  }
}
