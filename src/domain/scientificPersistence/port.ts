import type { PersistenceEnvelope, PersistenceResult } from './contracts';

export interface PersistencePort {
  readonly contractVersion: 'scientific-persistence-port/1.0.0';
  save(envelope: PersistenceEnvelope): Promise<PersistenceResult>;
}

export class PersistencePortException extends Error {
  readonly code: 'port_failure';

  constructor(code: 'port_failure', message: string) {
    if (message.trim().length === 0) {
      throw new Error('PersistencePortException message must be non-empty.');
    }
    super(message);
    this.name = 'PersistencePortException';
    this.code = code;
  }
}
