/**
 * Database persistence for Holographic Records
 * Enables cross-session pattern reconstruction from stored phase data
 */

import { supabase } from '@/integrations/supabase/client';
import { HolographicRecord } from './types';

interface DbHolographicRecord {
  id: string;
  phase_snapshot: Record<string, number>;
  pulsar_ids: string[];
  encoding_basis: string;
  amplitude_modulation: number[];
  content_hash: string;
  content_length: number;
  redundancy: number;
  coherence_at_storage: number;
  stored_at: number;
  preset_name: string | null;
  created_at: string;
}

/**
 * Convert DB record to HolographicRecord
 */
function fromDbRecord(db: DbHolographicRecord): HolographicRecord {
  return {
    id: db.id,
    phaseSnapshot: db.phase_snapshot,
    pulsarIds: db.pulsar_ids,
    encodingBasis: db.encoding_basis.split(',').map(Number),
    amplitudeModulation: db.amplitude_modulation,
    timestamp: new Date(db.created_at).getTime(),
    simulationTime: db.stored_at,
    contentHash: db.content_hash,
    contentLength: db.content_length,
    redundancy: db.redundancy,
    coherenceAtStorage: db.coherence_at_storage
  };
}

/**
 * Convert HolographicRecord to DB format
 */
function toDbRecord(record: HolographicRecord, presetName?: string): Omit<DbHolographicRecord, 'id' | 'created_at'> {
  return {
    phase_snapshot: record.phaseSnapshot,
    pulsar_ids: record.pulsarIds,
    encoding_basis: record.encodingBasis.join(','),
    amplitude_modulation: record.amplitudeModulation,
    content_hash: record.contentHash,
    content_length: record.contentLength,
    redundancy: record.redundancy,
    coherence_at_storage: record.coherenceAtStorage,
    stored_at: record.simulationTime,
    preset_name: presetName ?? null
  };
}

/**
 * Save a holographic record to the database
 */
export async function saveHolographicRecord(
  record: HolographicRecord,
  presetName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const dbRecord = toDbRecord(record, presetName);
    
    const { error } = await supabase
      .from('holographic_records')
      .insert(dbRecord);
    
    if (error) {
      console.error('Failed to save holographic record:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Exception saving holographic record:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Load all holographic records from the database
 */
export async function loadHolographicRecords(
  presetName?: string
): Promise<{ records: HolographicRecord[]; error?: string }> {
  try {
    let query = supabase
      .from('holographic_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (presetName) {
      query = query.eq('preset_name', presetName);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Failed to load holographic records:', error);
      return { records: [], error: error.message };
    }
    
    const records = (data as DbHolographicRecord[]).map(fromDbRecord);
    return { records };
  } catch (err) {
    console.error('Exception loading holographic records:', err);
    return { records: [], error: String(err) };
  }
}

/**
 * Delete a holographic record from the database
 */
export async function deleteHolographicRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('holographic_records')
      .delete()
      .eq('id', recordId);
    
    if (error) {
      console.error('Failed to delete holographic record:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Exception deleting holographic record:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Delete all holographic records for a preset
 */
export async function clearPresetRecords(
  presetName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('holographic_records')
      .delete()
      .eq('preset_name', presetName);
    
    if (error) {
      console.error('Failed to clear preset records:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Exception clearing preset records:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Count records by preset
 */
export async function countRecordsByPreset(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('holographic_records')
      .select('preset_name');
    
    if (error || !data) return {};
    
    const counts: Record<string, number> = {};
    for (const row of data) {
      const name = row.preset_name || 'unknown';
      counts[name] = (counts[name] || 0) + 1;
    }
    
    return counts;
  } catch {
    return {};
  }
}
