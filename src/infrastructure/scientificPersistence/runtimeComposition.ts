import { PersistenceService } from '../../domain/scientificPersistence';
import { supabase } from '../../lib/supabase';
import { SCIENTIFIC_PERSISTENCE_METADATA } from './metadata';
import { SupabasePersistencePort } from './supabasePersistencePort';

const supabasePersistencePort = new SupabasePersistencePort(supabase);

export const SCIENTIFIC_PERSISTENCE_SERVICE = new PersistenceService(
  supabasePersistencePort,
);

export { SCIENTIFIC_PERSISTENCE_METADATA };
