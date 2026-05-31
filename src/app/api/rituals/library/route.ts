import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const RitualTypeSchema = z.enum([
  'protection',
  'abundance',
  'love',
  'cleansing',
  'ancestral',
  'spiritual_growth',
  'healing',
  'chakra',
  'full_moon',
  'new_moon',
  'gratitude',
  'seasonal',
]);
const RitualQuerySchema = z.object({
  tipo: RitualTypeSchema.optional(),
  search: z.string().optional(),
  id: z.string().optional(),
  duracao: z.string().optional(),
  element: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
// Ritual library complete data
const rituals = [
  // Protection Rituals
  { id: 'prot-001', nome: 'Shield of Light', tipo: 'protection', duracao: '15 min', elements: ['luz', 'fogo'] },
  { id: 'prot-002', nome: 'Guardian Circle', tipo: 'protection', duracao: '20 min', elements: ['terra', 'éter'] },
  { id: 'prot-003', nome: 'Divine Armor', tipo: 'protection', duracao: '10 min', elements: ['fogo', 'luz'] },
  { id: 'prot-004', nome: 'Sacred Boundary', tipo: 'protection', duracao: '25 min', elements: ['agua', 'terra'] },
  { id: 'prot-005', nome: 'Aurora Protection', tipo: 'protection', duracao: '30 min', elements: ['luz', 'agua'] },
  { id: 'prot-006', nome: 'Spiritual Shield', tipo: 'protection', duracao: '15 min', elements: ['éter', 'luz'] },
  { id: 'prot-007', nome: 'Cosmic Armor', tipo: 'protection', duracao: '20 min', elements: ['fogo', 'éter'] },
  { id: 'prot-008', nome: 'Heavenly Barrier', tipo: 'protection', duracao: '10 min', elements: ['luz', 'fogo'] },
  { id: 'prot-009', nome: 'Ethereal Shield', tipo: 'protection', duracao: '15 min', elements: ['éter', 'agua'] },
  { id: 'prot-010', nome: 'Light Warriors', tipo: 'protection', duracao: '30 min', elements: ['luz', 'fogo'] },
  { id: 'prot-011', nome: 'Guardian Angels', tipo: 'protection', duracao: '20 min', elements: ['luz', 'éter'] },
  { id: 'prot-012', nome: 'Sacred Fire Circle', tipo: 'protection', duracao: '25 min', elements: ['fogo', 'terra'] },
  { id: 'prot-013', nome: 'Divine Light Shield', tipo: 'protection', duracao: '15 min', elements: ['luz', 'agua'] },
  { id: 'prot-014', nome: 'Spiritual Guardian', tipo: 'protection', duracao: '20 min', elements: ['éter', 'fogo'] },
  { id: 'prot-015', nome: 'Archangel Shield', tipo: 'protection', duracao: '30 min', elements: ['luz', 'fogo'] },
  { id: 'prot-016', nome: 'Cosmic Protection', tipo: 'protection', duracao: '25 min', elements: ['éter', 'luz'] },
  { id: 'prot-017', nome: 'Holy Armor', tipo: 'protection', duracao: '20 min', elements: ['luz', 'éter'] },
  { id: 'prot-018', nome: 'Radiant Shield', tipo: 'protection', duracao: '15 min', elements: ['luz', 'agua'] },
  { id: 'prot-019', nome: 'Spiritual Fortress', tipo: 'protection', duracao: '30 min', elements: ['terra', 'fogo'] },
  { id: 'prot-020', nome: 'Divine Barrier', tipo: 'protection', duracao: '25 min', elements: ['fogo', 'luz'] },
  { id: 'prot-021', nome: 'Light Circle', tipo: 'protection', duracao: '15 min', elements: ['luz', 'éter'] },
  { id: 'prot-022', nome: 'Sacred Shield', tipo: 'protection', duracao: '20 min', elements: ['fogo', 'agua'] },
  { id: 'prot-023', nome: 'Heavenly Guard', tipo: 'protection', duracao: '30 min', elements: ['luz', 'terra'] },
  { id: 'prot-024', nome: 'Spirit Guardian', tipo: 'protection', duracao: '20 min', elements: ['éter', 'luz'] },
  // Abundance Rituals
  { id: 'abund-001', nome: 'Abundance Flow', tipo: 'abundance', duracao: '20 min', elements: ['terra', 'agua'] },
  { id: 'abund-002', nome: 'Prosperity Altar', tipo: 'abundance', duracao: '15 min', elements: ['terra', 'fogo'] },
  { id: 'abund-003', nome: 'Manifestation Ritual', tipo: 'abundance', duracao: '30 min', elements: ['fogo', 'luz'] },
  { id: 'abund-004', nome: 'Wealth Attraction', tipo: 'abundance', duracao: '25 min', elements: ['terra', 'luz'] },
  { id: 'abund-005', nome: 'Success Gateway', tipo: 'abundance', duracao: '20 min', elements: ['fogo', 'terra'] },
  { id: 'abund-006', nome: 'Prosperity Stream', tipo: 'abundance', duracao: '15 min', elements: ['agua', 'terra'] },
  { id: 'abund-007', nome: 'Abundance Castle', tipo: 'abundance', duracao: '30 min', elements: ['terra', 'luz'] },
  { id: 'abund-008', nome: 'Wealth Crystal', tipo: 'abundance', duracao: '25 min', elements: ['crystal', 'terra'] },
  { id: 'abund-009', nome: 'Money Tree', tipo: 'abundance', duracao: '20 min', elements: ['terra', 'agua'] },
  { id: 'abund-010', nome: 'Golden Light', tipo: 'abundance', duracao: '15 min', elements: ['luz', 'fogo'] },
  { id: 'abund-011', nome: 'Prosperity Path', tipo: 'abundance', duracao: '25 min', elements: ['terra', 'fogo'] },
  { id: 'abund-012', nome: 'Abundance Altar', tipo: 'abundance', duracao: '30 min', elements: ['terra', 'luz'] },
  { id: 'abund-013', nome: 'Wealth Gateway', tipo: 'abundance', duracao: '20 min', elements: ['fogo', 'luz'] },
  { id: 'abund-014', nome: 'Money Magnet', tipo: 'abundance', duracao: '15 min', elements: ['terra', 'agua'] },
  { id: 'abund-015', nome: 'Prosperity Crystal', tipo: 'abundance', duracao: '25 min', elements: ['crystal', 'terra'] },
  { id: 'abund-016', nome: 'Abundance Stream', tipo: 'abundance', duracao: '30 min', elements: ['agua', 'terra'] },
  { id: 'abund-017', nome: 'Wealth Altar', tipo: 'abundance', duracao: '20 min', elements: ['terra', 'fogo'] },
  { id: 'abund-018', nome: 'Golden Path', tipo: 'abundance', duracao: '15 min', elements: ['luz', 'terra'] },
  // Love Rituals
  { id: 'love-001', nome: 'Heart Chakra Opening', tipo: 'love', duracao: '20 min', elements: ['agua', 'luz'] },
  { id: 'love-002', nome: 'Soulmate Attraction', tipo: 'love', duracao: '25 min', elements: ['fogo', 'agua'] },
  { id: 'love-003', nome: 'Sacred Union', tipo: 'love', duracao: '30 min', elements: ['fogo', 'luz'] },
  { id: 'love-004', nome: 'Self-Love Ritual', tipo: 'love', duracao: '15 min', elements: ['agua', 'luz'] },
  { id: 'love-005', nome: 'Relationship Healing', tipo: 'love', duracao: '20 min', elements: ['agua', 'éter'] },
  { id: 'love-006', nome: 'Love Enchantment', tipo: 'love', duracao: '25 min', elements: ['fogo', 'agua'] },
  { id: 'love-007', nome: 'Heart Opening', tipo: 'love', duracao: '15 min', elements: ['luz', 'agua'] },
  { id: 'love-008', nome: 'Soul Connection', tipo: 'love', duracao: '30 min', elements: ['fogo', 'luz'] },
  { id: 'love-009', nome: 'Love Magnet', tipo: 'love', duracao: '20 min', elements: ['fogo', 'agua'] },
  { id: 'love-010', nome: 'Divine Love', tipo: 'love', duracao: '25 min', elements: ['luz', 'fogo'] },
  { id: 'love-011', nome: 'Heart Healing', tipo: 'love', duracao: '15 min', elements: ['agua', 'éter'] },
  { id: 'love-012', nome: 'Love Flow', tipo: 'love', duracao: '20 min', elements: ['agua', 'luz'] },
  { id: 'love-013', nome: 'Soulmate召唤', tipo: 'love', duracao: '30 min', elements: ['fogo', 'luz'] },
  { id: 'love-014', nome: 'Sacred Heart', tipo: 'love', duracao: '25 min', elements: ['luz', 'agua'] },
  { id: 'love-015', nome: 'Love Temple', tipo: 'love', duracao: '20 min', elements: ['fogo', 'éter'] },
  { id: 'love-016', nome: 'Heart Light', tipo: 'love', duracao: '15 min', elements: ['luz', 'agua'] },
  // Cleansing Rituals
  { id: 'clean-001', nome: 'Smudge Ceremony', tipo: 'cleansing', duracao: '15 min', elements: ['fogo', 'éter'] },
  { id: 'clean-002', nome: 'Salt Circle', tipo: 'cleansing', duracao: '20 min', elements: ['terra', 'agua'] },
  { id: 'clean-003', nome: 'White Light Purification', tipo: 'cleansing', duracao: '10 min', elements: ['luz', 'éter'] },
  { id: 'clean-004', nome: 'Sacred Water Bath', tipo: 'cleansing', duracao: '25 min', elements: ['agua', 'luz'] },
  { id: 'clean-005', nome: 'Aura Cleansing', tipo: 'cleansing', duracao: '20 min', elements: ['luz', 'éter'] },
  { id: 'clean-006', nome: 'Smoke Purification', tipo: 'cleansing', duracao: '15 min', elements: ['fogo', 'éter'] },
  { id: 'clean-007', nome: 'Salt Bath', tipo: 'cleansing', duracao: '25 min', elements: ['agua', 'terra'] },
  { id: 'clean-008', nome: 'Light Cleansing', tipo: 'cleansing', duracao: '10 min', elements: ['luz', 'água'] },
  { id: 'clean-009', nome: 'Spiritual Bath', tipo: 'cleansing', duracao: '30 min', elements: ['agua', 'luz'] },
  { id: 'clean-010', nome: 'Energy Clearing', tipo: 'cleansing', duracao: '20 min', elements: ['éter', 'luz'] },
  { id: 'clean-011', nome: 'Sacred Smudge', tipo: 'cleansing', duracao: '15 min', elements: ['fogo', 'éter'] },
  { id: 'clean-012', nome: 'Purification Ritual', tipo: 'cleansing', duracao: '25 min', elements: ['agua', 'fogo'] },
  { id: 'clean-013', nome: 'Aura Purification', tipo: 'cleansing', duracao: '20 min', elements: ['luz', 'éter'] },
  { id: 'clean-014', nome: 'Space Clearing', tipo: 'cleansing', duracao: '15 min', elements: ['éter', 'fogo'] },
  { id: 'clean-015', nome: 'Crystal Cleansing', tipo: 'cleansing', duracao: '25 min', elements: ['crystal', 'luz'] },
  { id: 'clean-016', nome: 'Spiritual Cleanse', tipo: 'cleansing', duracao: '20 min', elements: ['água', 'luz'] },
  // Ancestral Rituals
  { id: 'ances-001', nome: 'Ancestral Connection', tipo: 'ancestral', duracao: '30 min', elements: ['terra', 'éter'] },
  { id: 'ances-002', nome: 'Genealogy Healing', tipo: 'ancestral', duracao: '25 min', elements: ['terra', 'agua'] },
  { id: 'ances-003', nome: 'Bloodline Blessing', tipo: 'ancestral', duracao: '20 min', elements: ['fogo', 'terra'] },
  { id: 'ances-004', nome: 'Spirit Ancestor Ritual', tipo: 'ancestral', duracao: '30 min', elements: ['éter', 'luz'] },
  { id: 'ances-005', nome: 'Linha do Tempo Ancestral', tipo: 'ancestral', duracao: '25 min', elements: ['terra', 'éter'] },
  { id: 'ances-006', nome: 'Ancestral Altar', tipo: 'ancestral', duracao: '20 min', elements: ['terra', 'agua'] },
  { id: 'ances-007', nome: 'Family Healing', tipo: 'ancestral', duracao: '30 min', elements: ['fogo', 'terra'] },
  { id: 'ances-008', nome: 'Spirit Release', tipo: 'ancestral', duracao: '25 min', elements: ['éter', 'fogo'] },
  { id: 'ances-009', nome: 'Ancestral Guidance', tipo: 'ancestral', duracao: '20 min', elements: ['luz', 'terra'] },
  { id: 'ances-010', nome: 'Past Life Integration', tipo: 'ancestral', duracao: '30 min', elements: ['éter', 'luz'] },
  { id: 'ances-011', nome: 'Family Tree Healing', tipo: 'ancestral', duracao: '25 min', elements: ['terra', 'agua'] },
  { id: 'ances-012', nome: 'Ancestral Blessing', tipo: 'ancestral', duracao: '20 min', elements: ['fogo', 'luz'] },
  { id: 'ances-013', nome: 'Spirit Connection', tipo: 'ancestral', duracao: '30 min', elements: ['éter', 'terra'] },
  { id: 'ances-014', nome: 'Ancestral Powers', tipo: 'ancestral', duracao: '25 min', elements: ['fogo', 'éter'] },
  { id: 'ances-015', nome: 'Lineage Healing', tipo: 'ancestral', duracao: '20 min', elements: ['terra', 'luz'] },
  { id: 'ances-016', nome: 'Family Karma', tipo: 'ancestral', duracao: '30 min', elements: ['terra', 'fogo'] },
  // Spiritual Growth Rituals
  { id: 'spirit-001', nome: 'Third Eye Activation', tipo: 'spiritual_growth', duracao: '20 min', elements: ['éter', 'luz'] },
  { id: 'spirit-002', nome: 'Chakra Alignment', tipo: 'spiritual_growth', duracao: '30 min', elements: ['luz', 'fogo'] },
  { id: 'spirit-003', nome: 'Meditation Mastery', tipo: 'spiritual_growth', duracao: '25 min', elements: ['éter', 'agua'] },
  { id: 'spirit-004', nome: 'Divine Connection', tipo: 'spiritual_growth', duracao: '20 min', elements: ['luz', 'éter'] },
  { id: 'spirit-005', nome: 'Kundalini Awakening', tipo: 'spiritual_growth', duracao: '30 min', elements: ['fogo', 'terra'] },
  { id: 'spirit-006', nome: 'Soul Ascension', tipo: 'spiritual_growth', duracao: '25 min', elements: ['luz', 'éter'] },
  { id: 'spirit-007', nome: 'Spiritual Enlightenment', tipo: 'spiritual_growth', duracao: '30 min', elements: ['luz', 'água'] },
  { id: 'spirit-008', nome: 'Higher Self Connection', tipo: 'spiritual_growth', duracao: '20 min', elements: ['éter', 'luz'] },
  { id: 'spirit-009', nome: 'Divine Wisdom', tipo: 'spiritual_growth', duracao: '25 min', elements: ['luz', 'fogo'] },
  { id: 'spirit-010', nome: 'Spiritual Awakening', tipo: 'spiritual_growth', duracao: '30 min', elements: ['éter', 'luz'] },
  { id: 'spirit-011', nome: 'Third Eye Opening', tipo: 'spiritual_growth', duracao: '20 min', elements: ['éter', 'luz'] },
  { id: 'spirit-012', nome: 'Crown Activation', tipo: 'spiritual_growth', duracao: '25 min', elements: ['luz', 'éter'] },
  { id: 'spirit-013', nome: 'Spiritual Journey', tipo: 'spiritual_growth', duracao: '30 min', elements: ['éter', 'fogo'] },
  { id: 'spirit-014', nome: 'Divine Light', tipo: 'spiritual_growth', duracao: '20 min', elements: ['luz', 'água'] },
  { id: 'spirit-015', nome: 'Soul Star Activation', tipo: 'spiritual_growth', duracao: '25 min', elements: ['luz', 'éter'] },
  // Healing Rituals
  { id: 'heal-001', nome: 'Reiki Healing', tipo: 'healing', duracao: '30 min', elements: ['luz', 'agua'] },
  { id: 'heal-002', nome: 'Sound Healing', tipo: 'healing', duracao: '25 min', elements: ['éter', 'luz'] },
  { id: 'heal-003', nome: 'Crystal Therapy', tipo: 'healing', duracao: '20 min', elements: ['crystal', 'luz'] },
  { id: 'heal-004', nome: 'Energy Healing', tipo: 'healing', duracao: '30 min', elements: ['luz', 'éter'] },
  { id: 'heal-005', nome: 'Chakra Healing', tipo: 'healing', duracao: '25 min', elements: ['fogo', 'luz'] },
  { id: 'heal-006', nome: 'Spiritual Healing', tipo: 'healing', duracao: '30 min', elements: ['luz', 'agua'] },
  { id: 'heal-007', nome: 'Divine Healing', tipo: 'healing', duracao: '25 min', elements: ['luz', 'éter'] },
  { id: 'heal-008', nome: 'Light Therapy', tipo: 'healing', duracao: '20 min', elements: ['luz', 'agua'] },
  { id: 'heal-009', nome: 'Energy Cleanse', tipo: 'healing', duracao: '30 min', elements: ['éter', 'luz'] },
  { id: 'heal-010', nome: 'Soul Healing', tipo: 'healing', duracao: '25 min', elements: ['luz', 'fogo'] },
  { id: 'heal-011', nome: 'Body Healing', tipo: 'healing', duracao: '20 min', elements: ['agua', 'luz'] },
  { id: 'heal-012', nome: 'Mind Healing', tipo: 'healing', duracao: '30 min', elements: ['éter', 'luz'] },
  { id: 'heal-013', nome: 'Heart Healing', tipo: 'healing', duracao: '25 min', elements: ['agua', 'luz'] },
  { id: 'heal-014', nome: 'Spiritual Recovery', tipo: 'healing', duracao: '30 min', elements: ['luz', 'éter'] },
  { id: 'heal-015', nome: 'Divine Restoration', tipo: 'healing', duracao: '25 min', elements: ['luz', 'fogo'] },
  { id: 'heal-016', nome: 'Energy Renewal', tipo: 'healing', duracao: '20 min', elements: ['éter', 'agua'] },
  // Chakra Rituals
  { id: 'chakra-001', nome: 'Root Activation', tipo: 'chakra', duracao: '20 min', elements: ['terra', 'fogo'] },
  { id: 'chakra-002', nome: 'Sacral Balance', tipo: 'chakra', duracao: '25 min', elements: ['agua', 'fogo'] },
  { id: 'chakra-003', nome: 'Solar Opening', tipo: 'chakra', duracao: '20 min', elements: ['fogo', 'luz'] },
  { id: 'chakra-004', nome: 'Heart Integration', tipo: 'chakra', duracao: '25 min', elements: ['agua', 'luz'] },
  { id: 'chakra-005', nome: 'Throat Expression', tipo: 'chakra', duracao: '20 min', elements: ['éter', 'luz'] },
  { id: 'chakra-006', nome: 'Third Eye Vision', tipo: 'chakra', duracao: '25 min', elements: ['éter', 'fogo'] },
  { id: 'chakra-007', nome: 'Crown Connection', tipo: 'chakra', duracao: '30 min', elements: ['luz', 'éter'] },
  { id: 'chakra-008', nome: 'All Chakras', tipo: 'chakra', duracao: '45 min', elements: ['luz', 'fogo', 'agua', 'terra'] },
  { id: 'chakra-009', nome: 'Base Chakra', tipo: 'chakra', duracao: '20 min', elements: ['terra', 'fogo'] },
  { id: 'chakra-010', nome: 'Sex Chakra', tipo: 'chakra', duracao: '25 min', elements: ['agua', 'fogo'] },
  { id: 'chakra-011', nome: 'Navel Chakra', tipo: 'chakra', duracao: '20 min', elements: ['fogo', 'luz'] },
  { id: 'chakra-012', nome: 'Heart Chakra', tipo: 'chakra', duracao: '25 min', elements: ['agua', 'luz'] },
  { id: 'chakra-013', nome: 'Throat Chakra', tipo: 'chakra', duracao: '20 min', elements: ['éter', 'luz'] },
  { id: 'chakra-014', nome: 'Brow Chakra', tipo: 'chakra', duracao: '25 min', elements: ['éter', 'fogo'] },
  { id: 'chakra-015', nome: 'Crown Chakra', tipo: 'chakra', duracao: '30 min', elements: ['luz', 'éter'] },
  { id: 'chakra-016', nome: 'Full Chakra Balancing', tipo: 'chakra', duracao: '45 min', elements: ['luz', 'agua', 'fogo', 'terra', 'éter'] },
  // Full Moon Rituals
  { id: 'fullmoon-001', nome: 'Full Moon Manifestation', tipo: 'full_moon', duracao: '30 min', elements: ['luz', 'agua'] },
  { id: 'fullmoon-002', nome: 'Moonlight Charging', tipo: 'full_moon', duracao: '25 min', elements: ['luz', 'éter'] },
  { id: 'fullmoon-003', nome: 'Lunar Energy Bath', tipo: 'full_moon', duracao: '30 min', elements: ['agua', 'luz'] },
  { id: 'fullmoon-004', nome: 'Intention Setting', tipo: 'full_moon', duracao: '20 min', elements: ['luz', 'éter'] },
  { id: 'fullmoon-005', nome: 'Release Ritual', tipo: 'full_moon', duracao: '25 min', elements: ['agua', 'fogo'] },
  { id: 'fullmoon-006', nome: 'Divine Blessing', tipo: 'full_moon', duracao: '30 min', elements: ['luz', 'éter'] },
  { id: 'fullmoon-007', nome: 'Spiritual Cleansing', tipo: 'full_moon', duracao: '25 min', elements: ['lua', 'agua'] },
  { id: 'fullmoon-008', nome: 'Wish Ritual', tipo: 'full_moon', duracao: '20 min', elements: ['luz', 'éter'] },
  { id: 'fullmoon-009', nome: 'Full Moon Meditation', tipo: 'full_moon', duracao: '30 min', elements: ['luz', 'agua'] },
  { id: 'fullmoon-010', nome: 'Energy Amplification', tipo: 'full_moon', duracao: '25 min', elements: ['luz', 'fogo'] },
  // New Moon Rituals
  { id: 'newmoon-001', nome: 'New Beginnings', tipo: 'new_moon', duracao: '25 min', elements: ['éter', 'luz'] },
  { id: 'newmoon-002', nome: 'Seed Planting', tipo: 'new_moon', duracao: '20 min', elements: ['terra', 'agua'] },
  { id: 'newmoon-003', nome: 'Fresh Start', tipo: 'new_moon', duracao: '30 min', elements: ['éter', 'fogo'] },
  { id: 'newmoon-004', nome: 'New Intentions', tipo: 'new_moon', duracao: '25 min', elements: ['luz', 'éter'] },
  { id: 'newmoon-005', nome: 'Shadow Work', tipo: 'new_moon', duracao: '30 min', elements: ['éter', 'agua'] },
  { id: 'newmoon-006', nome: 'Inner Reflection', tipo: 'new_moon', duracao: '25 min', elements: ['éter', 'luz'] },
  { id: 'newmoon-007', nome: 'Creation Ritual', tipo: 'new_moon', duracao: '20 min', elements: ['fogo', 'terra'] },
  { id: 'newmoon-008', nome: 'New Moon Meditation', tipo: 'new_moon', duracao: '30 min', elements: ['éter', 'luz'] },
  // Gratitude Rituals
  { id: 'grat-001', nome: 'Gratitude Altar', tipo: 'gratitude', duracao: '15 min', elements: ['terra', 'luz'] },
  { id: 'grat-002', nome: 'Thankfulness Journal', tipo: 'gratitude', duracao: '10 min', elements: ['éter', 'luz'] },
  { id: 'grat-003', nome: 'Blessings Count', tipo: 'gratitude', duracao: '20 min', elements: ['luz', 'agua'] },
  { id: 'grat-004', nome: 'Divine Thanks', tipo: 'gratitude', duracao: '15 min', elements: ['luz', 'éter'] },
  { id: 'grat-005', nome: 'Abundance Thanks', tipo: 'gratitude', duracao: '20 min', elements: ['terra', 'fogo'] },
  { id: 'grat-006', nome: 'Spiritual Appreciation', tipo: 'gratitude', duracao: '15 min', elements: ['luz', 'éter'] },
  { id: 'grat-007', nome: 'Thank You Ritual', tipo: 'gratitude', duracao: '10 min', elements: ['luz', 'agua'] },
  { id: 'grat-008', nome: 'Gratitude Meditation', tipo: 'gratitude', duracao: '20 min', elements: ['éter', 'luz'] },
  // Seasonal Rituals
  { id: 'season-001', nome: 'Spring Equinox', tipo: 'seasonal', duracao: '30 min', elements: ['terra', 'agua'] },
  { id: 'season-002', nome: 'Summer Solstice', tipo: 'seasonal', duracao: '30 min', elements: ['fogo', 'luz'] },
  { id: 'season-003', nome: 'Fall Equinox', tipo: 'seasonal', duracao: '25 min', elements: ['terra', 'fogo'] },
  { id: 'season-004', nome: 'Winter Solstice', tipo: 'seasonal', duracao: '30 min', elements: ['agua', 'luz'] },
  { id: 'season-005', nome: 'Sabbats Celebration', tipo: 'seasonal', duracao: '25 min', elements: ['fogo', 'terra'] },
  { id: 'season-006', nome: 'Seasonal Cleansing', tipo: 'seasonal', duracao: '30 min', elements: ['éter', 'agua'] },
  { id: 'season-007', nome: 'Nature Connection', tipo: 'seasonal', duracao: '25 min', elements: ['terra', 'agua'] },
  { id: 'season-008', nome: 'Earth Gratitude', tipo: 'seasonal', duracao: '20 min', elements: ['terra', 'luz'] },
  { id: 'season-009', nome: 'Celestial Alignment', tipo: 'seasonal', duracao: '30 min', elements: ['luz', 'éter'] },
  { id: 'season-010', nome: 'Solar Celebration', tipo: 'seasonal', duracao: '25 min', elements: ['fogo', 'luz'] },
  { id: 'season-011', nome: 'Lunar Cycle', tipo: 'seasonal', duracao: '20 min', elements: ['lua', 'agua'] },
  { id: 'season-012', nome: 'Elemental Balance', tipo: 'seasonal', duracao: '30 min', elements: ['fogo', 'agua', 'terra', 'éter'] },
];
interface Ritual {
  id: string;
  nome: string;
  tipo: string;
  duracao: string;
  elements?: string[];
}
// GET /api/rituals/library - returns all rituals
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = RitualQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      search: searchParams.get('search'),
      id: searchParams.get('id'),
      duracao: searchParams.get('duracao'),
      element: searchParams.get('element'),
      limit: searchParams.get('limit'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { tipo, search, id, duracao, element, limit } = parseResult.data;
    // Filter by specific ritual ID
    if (id) {
      const ritual = rituals.find(r => r.id === id);
      if (!ritual) {
        return NextResponse.json(
          { error: 'Ritual not found', id },
          { status: 404 }
        );
      }
      return NextResponse.json(ritual);
    }
    let filteredRituals = rituals;
    // Filter by tipo
    if (tipo) {
      filteredRituals = filteredRituals.filter(ritual =>
        ritual.tipo.toLowerCase() === tipo.toLowerCase()
      );
    }
    // Filter by duration
    if (duracao) {
      const durationMatch = duracao.match(/^(\d+)$/);
      if (durationMatch) {
        const maxMinutes = parseInt(durationMatch[1], 10);
        filteredRituals = filteredRituals.filter(ritual => {
          const match = ritual.duracao.match(/^(\d+)/);
          if (match) {
            const ritualMinutes = parseInt(match[1], 10);
            return ritualMinutes <= maxMinutes;
          }
          return true;
        });
      }
    }
    // Filter by element
    if (element) {
      filteredRituals = filteredRituals.filter(ritual =>
        ritual.elements?.some(el => el.toLowerCase().includes(element.toLowerCase()))
      );
    }
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRituals = filteredRituals.filter(ritual =>
        ritual.nome.toLowerCase().includes(searchLower) ||
        ritual.tipo.toLowerCase().includes(searchLower)
      );
    }
    // Apply limit
    if (limit) {
      filteredRituals = filteredRituals.slice(0, limit);
    }
    return NextResponse.json({
      rituals: filteredRituals,
      count: filteredRituals.length,
      total: rituals.length,
    });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar rituais',
    }, { status: 500 });
  }
}
const EXTRA_RITUALS = [
  {
    id: 'protection-candle',
    nome: 'Ritual de Proteção com Vela',
    tipo: 'proteção',
    duracao: '30 minutos',
    materiais: ['Vela branca', 'Sal grosso', 'Alho', 'Alecrim'],
    passos: [
      'Acenda a vela branca no centro do altar',
      'Despeje um círculo de sal grosso ao redor',
      'Coloque os dentes de alho dentro do círculo',
      'Adicione alecrim sobre o sal',
      'Recite a oração de proteção 3 vezes',
      'Deixe a vela queimar até o fim'
    ],
    significado: 'Cria uma barreira protetora contra energias negativas',
    keywords: ['proteção', 'segurança', 'barreira', 'limpeza']
  },
  {
    id: 'protection-salt-bath',
    nome: 'Banho de Sal e Arruda',
    tipo: 'proteção',
    duracao: '20 minutos',
    descricao: 'Ritual de purificação usando sal grosso e arruda para remover energias negativas.',
    materiais: ['Sal grosso', 'Arruda', 'Alcachofra', 'Água'],
    passos: [
      'Ferva 1 litro de água',
      'Adicione o sal grosso à água fervente',
      'Jogue arruda e alcachofra na mistura',
      'Deixe esfriar até temperatura ambiente',
      'Coe e despeje sobre o corpo',
      'Enxágue com água corrente'
    ],
    significado: 'Purifica o campo áurico e remove energias densas',
    keywords: ['purificação', 'banho', 'limpeza', 'proteção']
  },
  // Abundance Rituals
  {
    id: 'abundance-candle',
    nome: 'Vela da Abundância',
    tipo: 'abundância',
    duracao: '40 minutos',
    descricao: 'Ritual para manifestar prosperidade usando vela verde e moedas.',
    materiais: ['Vela verde', '7 moedas de cobre', 'Canela', 'Mel'],
    passos: [
      'Coloque a vela verde no centro do altar',
      'Disponha as 7 moedas em círculo ao redor',
      'Polvilhe canela sobre as moedas',
      'Desenhe um símbolo de riqueza na vela',
      'Acenda a vela enquanto visualiza abundância',
      'Agradeça pela prosperidade que virá'
    ],
    significado: 'Atrai prosperidade e abre caminhos para a abundância',
    keywords: ['abundância', 'prosperidade', 'dinheiro', 'riqueza']
  },
  {
    id: 'full-moon-abundance',
    nome: 'Ritual da Lua Cheia',
    tipo: 'abundância',
    duracao: '25 minutos',
    descricao: 'Ritual poderoso realizado na lua cheia para amplificar intenções.',
    materiais: ['Cristal de quartzo', 'Água lunar', 'Papel branco', 'Caneta dourada'],
    passos: [
      'Escreva seu desejo no papel branco com caneta dourada',
      'Coloque a água lunar em um recipiente de vidro',
      'Mergulhe o cristal de quartzo na água',
      'Coloque o papel dobrado ao lado',
      'Exponha à luz da lua cheia por 15 minutos',
      'Guarde o papel em lugar sagrado'
    ],
    significado: 'Amplifica intenções e manifesta desejos',
    keywords: ['lua cheia', 'manifestação', 'intenção', 'amplificação']
  },
  // Love Rituals
  {
    id: 'love-candle',
    nome: 'Vela do Amor',
    tipo: 'amor',
    duracao: '35 minutos',
    descricao: 'Ritual romântico para atrair amor ou fortalecer relacionamentos.',
    materiais: ['Vela rosa', 'Vela vermelha', 'Pétalas de rosa', 'Perfume de jasmim'],
    passos: [
      'Acenda a vela rosa à esquerda e vermelha à direita',
      'Coloque as pétalas de rosa entre as velas',
      'Aplique perfume de jasmim nos pulsos',
      'Visualize a pessoa amada em sua mente',
      'Recite o mantra de amor 7 vezes',
      'Deixe as velas queimarem juntas'
    ],
    significado: 'Abre o coração para o amor verdadeiro',
    keywords: ['amor', 'relacionamento', 'atração', 'coração']
  },
  {
    id: 'self-love-bath',
    nome: 'Banho de Amor Próprio',
    tipo: 'amor',
    duracao: '30 minutos',
    descricao: 'Ritual de autoconhecimento e amor próprio para fortalecer a autoestima.',
    materiais: ['Rosa vermelha', 'Velas cor de rosa', 'Espelho pequeno', 'Água morna'],
    passos: [
      'Encha a banheira com água morna',
      'Adicione pétalas de rosa vermelha',
      'Acenda as velas cor de rosa ao redor',
      'Segure o espelho diante do seu rosto',
      'Olhe nos seus próprios olhos e declare amor próprio',
      'Permaneça na banheira em silêncio meditativo'
    ],
    significado: 'Fortalece o amor próprio e a autoaceitação',
    keywords: ['amor próprio', 'autoestima', 'autoconhecimento', 'aceitação']
  },
  // Cleansing Rituals
  {
    id: 'smudging',
    nome: 'Ritual de Smudging',
    tipo: 'limpeza',
    duracao: '20 minutos',
    descricao: 'Purificação energética usando ervas sagradas queimadas.',
    materiais: ['Sálvia branca', 'Arruda', 'Pau-brasil', 'Concha', 'Fósforo'],
    passos: [
      'Acenda as ervas na concha até criar fumaça',
      'Segure a concha com a mão esquerda',
      'Passe a fumaça pelo corpo da cabeça aos pés',
      'Não se esqueça das costas e solas dos pés',
      'Abençoe cada cômodo da casa',
      'Ao final, agradeça às ervas pela limpeza'
    ],
    significado: 'Purifica espaços e pessoas de energias densas',
    keywords: ['purificação', 'smudging', 'ervas', 'limpeza']
  },
  {
    id: 'egg-cleanse',
    nome: 'Limpeza com Ovo',
    tipo: 'limpeza',
    duracao: '25 minutos',
    descricao: 'Técnica de limpeza áurica usando ovo de galinha.',
    materiais: ['Ovo de galinha fresco', 'Vela branca', 'Sal grosso', 'Copo de vidro'],
    passos: [
      'Acenda a vela branca',
      'Segure o ovo na mão direita sobre a pessoa',
      'Passe o ovo por todo o corpo em movimentos circulares',
      'Repita por 10 minutos',
      'Quebre o ovo no copo de vidro com sal',
      'Observe o estado da gema para interpretar'
    ],
    significado: 'Remove energias negativas do campo áurico',
    keywords: ['limpeza', 'purificação', ' aura', 'cura']
  },
  // Ancestral Rituals
  {
    id: 'ancestral-offering',
    nome: 'Oferenda aos Ancestrais',
    tipo: 'ancestral',
    duracao: '45 minutos',
    descricao: 'Ritual de conexão com ancestrais através de oferendas.',
    materiais: ['Água limpa', 'Flor branca', 'Vela dourada', 'Prato branco', 'Comida favorita'],
    passos: [
      'Prepare um prato branco com comida favorita',
      'Coloque água limpa em um copo ao lado',
      'Acenda a vela dourada',
      'Coloque uma flor branca sobre o prato',
      'Convide seus ancestrais a se aproximarem',
      'Fale com eles, compartilhe novidades e agradeça'
    ],
    significado: 'Estabelece conexão com a linhagem ancestral',
    keywords: ['ancestrais', 'ancestralidade', 'oferenda', 'tradição']
  },
  {
    id: 'altar-maintenance',
    nome: 'Manutenção do Altar',
    tipo: 'ancestral',
    duracao: '30 minutos',
    descricao: 'Ritual regular para manter a energia do altar sagrado.',
    materiais: ['Velas', 'Incenso', 'Água', 'Flores frescas', 'Pano branco'],
    passos: [
      'Limpe o altar com pano branco úmido',
      'Troque a água dos recipientes',
      'Acenda velas frescas',
      'Queime incenso de sua preferência',
      'Coloque flores frescas',
      'Reorganize os objetos com intenção'
    ],
    significado: 'Mantém a energia vital do altar sagrado',
    keywords: ['altar', 'manutenção', 'sagrado', 'energia']
  },
  // Spiritual Growth Rituals
  {
    id: 'meditation-candle',
    nome: 'Vela da Meditação',
    tipo: 'crescimento',
    duracao: '45 minutos',
    descricao: 'Ritual para aprofundar a prática meditativa.',
    materiais: ['Vela azul', 'Incenso de sândalo', 'Cristal de lapis lazuli', 'Almofada'],
    passos: [
      'Prepare um espaço tranquilo para meditação',
      'Sente-se na almofada em posição confortável',
      'Acenda a vela azul e o incenso',
      'Segure o cristal de lapis lazuli',
      'Medite por 30 minutos em silêncio',
      'Gradualmente abra os olhos e agradeça'
    ],
    significado: 'Aprofunda a meditação e abre a intuição',
    keywords: ['meditação', 'intuição', 'crescimento', 'paz']
  },
  {
    id: 'new-beginnings',
    nome: 'Ritual de Novos Começos',
    tipo: 'crescimento',
    duracao: '35 minutos',
    descricao: 'Ritual para iniciar novos projetos ou fases da vida.',
    materiais: ['Vela laranja', 'Caneta nova', 'Papel amarelo', 'Porta-jóias pequeno'],
    passos: [
      'Escreva no papel amarelo o que deseja iniciar',
      'Dobre o papel 3 vezes no sentido horário',
      'Coloque dentro do porta-jóias junto com a caneta',
      'Acenda a vela laranja',
      'Segure o porta-jóias e declare sua intenção',
      'Guarde em lugar especial até concretização'
    ],
    significado: 'Marcaprojetos novos e ciclos de renovação',
    keywords: ['novos começos', 'início', 'renovação', 'projeto']
  },
  // Healing Rituals
  {
    id: 'healing-hands',
    nome: 'Ritual das Mãos Curadoras',
    tipo: 'cura',
    duracao: '30 minutos',
    descricao: 'Ritual para energizar as mãos para cura energética.',
    materiais: ['Vela violeta', 'Óleo de coco', 'Cristal de ametista', 'Água com sal'],
    passos: [
      'Lave bem as mãos com água e sal',
      'Aplique óleo de coco nas palmas',
      'Acenda a vela violeta',
      'Segure a ametista entre as mãos por 5 minutos',
      'Visualize energia curadora fluindo',
      'Agradeça pela energia de cura recebida'
    ],
    significado: 'Energiza as mãos para trabalho de cura',
    keywords: ['cura', 'energia', 'mãos', 'terapêutico']
  },
  {
    id: 'sleep-ritual',
    nome: 'Ritual do Sono Tranquilo',
    tipo: 'cura',
    duracao: '20 minutos',
    descricao: 'Ritual para preparar o corpo e a mente para um sono reparador.',
    materiais: ['Vela lavanda', 'Travesseiro de ervas', 'Água de lavanda', 'Cristal de lepidolita'],
    passos: [
      'Pulverize água de lavanda no travesseiro',
      'Coloque o cristal de lepidolita sob o travesseiro',
      'Acenda a vela lavanda',
      'Respire profundamente 7 vezes',
      'Apague a vela com gratidão',
      'Deite-se em paz e silêncio'
    ],
    significado: 'Promove sono profundo e reparador',
    keywords: ['sono', 'descanso', 'tranquilidade', 'relaxamento']
  },
  // Chakra Rituals
  {
    id: 'chakra-cleansing',
    nome: 'Limpeza dos Chakras',
    tipo: 'chakras',
    duracao: '50 minutos',
    descricao: 'Ritual completo de limpeza e equilíbrio dos 7 chakras principais.',
    materiais: ['7 velas coloridas', 'Incenso de olibano', 'Cristais correspondentes', 'Óleo de cânfora'],
    passos: [
      'Posicione as 7 velas em ordem do arco-íris',
      'Acenda cada vela começando pela raiz',
      'Queime incenso de olibano',
      'Aplique óleo nos pontos dos chakras',
      'Visualize cada chakra se abrindo e limpando',
      'Agradeça ao final com todas as velas acesas'
    ],
    significado: 'Equilibra e limpa todos os chakras',
    keywords: ['chakras', 'equilíbrio', 'energia', 'harmonia']
  },
  // Full Moon Rituals
  {
    id: 'full-moon-water',
    nome: 'Carregar Água na Lua Cheia',
    tipo: 'lua cheia',
    duracao: '15 minutos',
    descricao: 'Ritual para carregar água com energia da lua cheia.',
    materiais: ['Frasco de vidro transparente', 'Água filtrada', 'Prato branco', 'Flores brancas'],
    passos: [
      'Encha o frasco com água filtrada',
      'Feche bem e coloque no prato branco',
      'Decore com flores brancas ao redor',
      'Exponha à luar na noite de lua cheia',
      'Deixe de 3 a 12 horas',
      'Colete ao amanhecer e guarde protegido'
    ],
    significado: 'Energiza água com força lunar para uso ritual',
    keywords: ['lua cheia', 'água lunar', 'energia', 'carregamento']
  },
  // New Moon Rituals
  {
    id: 'new-moon-intentions',
    nome: 'Ritual da Lua Nova',
    tipo: 'lua nova',
    duracao: '30 minutos',
    descricao: 'Ritual para plantar sementes de intenção na lua nova.',
    materiais: ['Papel marrom', 'Caneta preta', 'Vela preta', 'Terra'],
    passos: [
      'Escreva suas intenções no papel marrom',
      'Dobre o papel no sentido anti-horário',
      'Acenda a vela preta',
      'Plante o papel dobrado na terra',
      'Regue com intenção de germinação',
      'Agradeça pela manifestação que virá'
    ],
    significado: 'Planta intenções para germinar na lua cheia',
    keywords: ['lua nova', 'intenções', 'plantio', 'manifestação']
  },
  // Gratitude Rituals
  {
    id: 'gratitude-bowl',
    nome: 'Tigela da Gratidão',
    tipo: 'gratidão',
    duracao: '20 minutos',
    descricao: 'Ritual diário de gratidão para elevar a vibração.',
    materiais: ['Tigela de cerâmica', 'Pedras pequenas', 'Caneta', 'Papel'],
    passos: [
      'Escolha uma pedra que te represente hoje',
      'Escreva uma gratidão no papel pequeno',
      'Dobre o papel e coloque na tigela',
      'Segure a pedra e agradeça',
      'Coloque a pedra junto com a gratidão',
      'Repita diariamente se possível'
    ],
    significado: 'Cultiva gratidão e eleva a vibração energética',
    keywords: ['gratidão', 'abundância', 'positividade', 'vibração']
  },
  // Seasonal Rituals
  {
    id: 'equinox-balance',
    nome: 'Ritual do Equinócio',
    tipo: 'sazonal',
    duracao: '60 minutos',
    descricao: 'Ritual de equilíbrio realizado nos equinócios de primavera e outono.',
    materiais: ['Vela branca', 'Vela preta', 'Espelho', 'Sal', 'Água'],
    passos: [
      'Coloque um espelho no centro do altar',
      'Dispõe sal à esquerda e água à direita',
      'Acenda vela branca à esquerda e preta à direita',
      'Sente-se diante do espelho',
      'Observe seu reflexo e equilibre masculine e feminine',
      'Integre os opostos em harmonia'
    ],
    significado: 'Equilibra masculino e feminino, luz e sombra',
    keywords: ['equinócio', 'equilíbrio', 'integração', 'sazonal']
  },
  {
    id: 'solstice-power',
    nome: 'Ritual do Solstício',
    tipo: 'sazonal',
    duracao: '45 minutos',
    descricao: 'Ritual de poder realizado nos solstícios de verão e inverno.',
    materiais: ['Vela dourada', 'Cristais', 'Frutos da estação', 'Incenso de mirra'],
    passos: [
      'Reúna cristais ao redor do altar',
      'Acenda incenso de mirra',
      'Acenda a vela dourada ao nascer/pôr do sol',
      'Coloque os frutos da estação como oferenda',
      'Celebre o poder do sol em qualquer forma',
      'Agradeça pela luz e calor vitais'
    ],
    significado: 'Celebra o poder do sol e ciclos solares',
    keywords: ['solstício', 'poder', 'sol', 'celebração']
  }
];

interface Ritual {
  id: string;
  nome: string;
  tipo: string;
  duracao: string;
  descricao: string;
  materiais: string[];
  passos: string[];
  significado: string;
  keywords: string[];
}
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const search = searchParams.get('search');
    const id = searchParams.get('id');
    const duracao = searchParams.get('duracao');
  if (id) {
    const ritual = rituals.find(r => r.id === id);
    if (!ritual) {
      return NextResponse.json(
        { error: 'Ritual not found', id },
        { status: 404 }
      );
    }
    return NextResponse.json(ritual);
  }

  // Filter by tipo (protection, abundance, love, cleansing, etc.)
  if (tipo) {
    filteredRituals = filteredRituals.filter(ritual => 
      ritual.tipo.toLowerCase() === tipo.toLowerCase()
    );
  }

  // Filter by duration
  if (duracao) {
    const durationMatch = duracao.match(/^(\d+)$/);
    if (durationMatch) {
      const maxMinutes = parseInt(durationMatch[1], 10);
      filteredRituals = filteredRituals.filter(ritual => {
        const match = ritual.duracao.match(/^(\d+)/);
        if (match) {
          const ritualMinutes = parseInt(match[1], 10);
          return ritualMinutes <= maxMinutes;
        }
        return true;
      });
    }
  }

  // Search by name, description, or keywords
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRituals = filteredRituals.filter(ritual =>
      ritual.nome.toLowerCase().includes(searchLower) ||
      ritual.descricao.toLowerCase().includes(searchLower) ||
      ritual.keywords.some(k => k.toLowerCase().includes(searchLower)) ||
      ritual.materiais.some(m => m.toLowerCase().includes(searchLower))
    );
  }

  // Get available ritual types
  const typeSet = new Set<string>();
  rituals.forEach(r => typeSet.add(r.tipo));
  const availableTypes = Array.from(typeSet).sort();

  // Transform rituals to include full data
  const result = filteredRituals.map(ritual => ({
    id: ritual.id,
    nome: ritual.nome,
    tipo: ritual.tipo,
    duracao: ritual.duracao,
    descricao: ritual.descricao,
    materiais: ritual.materiais,
    passos: ritual.passos,
    significado: ritual.significado,
    keywords: ritual.keywords,
  }));

  return NextResponse.json({
    rituals: result,
    meta: {
      total: result.length,
      types: availableTypes,
      filters: {
        tipo: tipo || null,
        search: search || null,
        duracao: duracao || null,
      },
    },
  });
}
