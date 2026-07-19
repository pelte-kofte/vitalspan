import type { PersistenceMetadata } from '../../domain/scientificPersistence';

export const SCIENTIFIC_PERSISTENCE_METADATA: PersistenceMetadata = Object.freeze({
  contractVersion: 'scientific-persistence-metadata/1.0.0',
  implementationId: 'supabase_postgresql_scientific_persistence',
  implementationVersion: 'supabase-scientific-persistence/1.0.0',
  schemaVersion: 'scientific-persistence-schema/1.0.0',
  modelVersion: 'scientific-persistence-storage-model/1.0.0',
});
