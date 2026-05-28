// ============================================================
// MARMA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Marma data
// - Vital energy points in Ayurvedic tradition
// - 107 primary Marma points mapped to body/nadis
// - Connection to doshas, chakras, and spiritual anatomy
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export interface MarmaPoint {
  id: string;
  name: string;
  nameSanskrit: string;
  namePt: string;
  location: string;
  locationDescription: string;
  region: string;
  subRegion?: string;
  dosha: string;
  element: string;
  marmaType: string;
  category: string;
  associatedChakra?: string;
  associatedNadis?: string[];
  energyFlow: string;
  connections: string[];
  therapeutic?: string[];
  precautions?: string[];
  symmetry: 'bilateral' | 'unilateral' | 'midline';
  vitalLevel: 1 | 2 | 3;
  anatomy: {
    muscle?: string;
    nerve?: string;
    bone?: string;
    organ?: string;
    vessel?: string;
  };
}

export interface MarmaRegion {
  id: string;
  name: string;
  namePt: string;
  pointCount: number;
  points: string[];
  significance: string;
}

export interface MarmaCategory {
  id: string;
  name: string;
  namePt: string;
  count: number;
  description: string;
}

// ============================================================
// MARMA POINT DATA
// ============================================================

const MARMA_POINTS: MarmaPoint[] = [
  // HEAD & NECK REGION
  {
    id: 'adhipati',
    name: 'Adhipati',
    nameSanskrit: 'आधिपति',
    namePt: 'Adhipati (Senhor da Cabeça)',
    location: 'Crown of head',
    locationDescription: 'Topmost point at the junction of sagittal and coronal sutures',
    region: 'head',
    subRegion: 'crown',
    dosha: 'vata',
    element: 'akasha',
    marmaType: 'shiva',
    category: 'vital',
    associatedChakra: 'sahasrara',
    associatedNadis: ['sushumna', 'idas', 'pingalas'],
    energyFlow: 'ascending',
    connections: ['brain', 'nervous_system', 'consciousness'],
    therapeutic: ['headache', 'mental_clarity', 'spiritual_connection'],
    precautions: ['never press forcefully'],
    symmetry: 'midline',
    vitalLevel: 1,
    anatomy: {
      bone: 'parietal',
      nerve: 'trigeminal_branch',
    },
  },
  {
    id: 'shankha',
    name: 'Shankha',
    nameSanskrit: 'शंख',
    namePt: 'Shankha (Templo)',
    location: 'Temporal region',
    locationDescription: 'Depression at the temple on both sides',
    region: 'head',
    subRegion: 'temple',
    dosha: 'pitta',
    element: 'agni',
    marmaType: 'agni',
    category: 'structural',
    associatedChakra: 'ajna',
    energyFlow: 'balanced',
    connections: ['eyes', 'temporal_lobe', 'digestion'],
    symmetry: 'bilateral',
    vitalLevel: 2,
    anatomy: {
      bone: 'temporal',
      muscle: 'temporalis',
      nerve: 'temporal_nerve',
    },
  },
  {
    id: 'utkshepa',
    name: 'Utkshepa',
    nameSanskrit: 'उत्क्षेप',
    namePt: 'Utkshepa (Sobrecílio)',
    location: 'Above the eyebrows',
    locationDescription: 'Depression just above the inner aspect of eyebrows',
    region: 'head',
    subRegion: 'forehead',
    dosha: 'kapha',
    element: 'prithvi',
    marmaType: 'soma',
    category: 'structural',
    associatedChakra: 'ajna',
    associatedNadis: ['idas', 'pingalas'],
    energyFlow: 'lateral',
    connections: ['pineal', 'pituitary', 'sinuses'],
    symmetry: 'bilateral',
    vitalLevel: 2,
    anatomy: {
      bone: 'frontal',
      nerve: 'supraorbital',
    },
  },
  {
    id: 'avarta',
    name: 'Avarta',
    nameSanskrit: 'अवर्त',
    namePt: 'Avarta (Sobrancelha)',
    location: 'Inner aspect of eyebrow',
    locationDescription: 'Inner canthus region of each eyebrow',
    region: 'head',
    subRegion: 'forehead',
    dosha: 'pitta',
    element: 'agni',
    marmaType: 'agni',
    category: 'structural',
    associatedChakra: 'ajna',
    energyFlow: 'converging',
    connections: ['eyes', 'frontal_lobe', 'decision_making'],
    symmetry: 'bilateral',
    vitalLevel: 2,
    anatomy: {
      nerve: 'supratrochlear',
      muscle: 'orbicularis_oculi',
    },
  },
  {
    id: 'stapani',
    name: 'Stapani',
    nameSanskrit: 'स्तपनी',
    namePt: 'Stapani (Ponto Central da Testa)',
    location: 'Center of forehead',
    locationDescription: 'Center point between eyebrows at third eye location',
    region: 'head',
    subRegion: 'forehead',
    dosha: 'kapha',
    element: 'ap',
    marmaType: 'soma',
    category: 'vital',
    associatedChakra: 'ajna',
    associatedNadis: ['sushumna', 'idas', 'pingalas'],
    energyFlow: 'central',
    connections: ['third_eye', 'pituitary', 'intuition'],
    therapeutic: ['anxiety', 'insomnia', 'concentration'],
    symmetry: 'midline',
    vitalLevel: 1,
    anatomy: {
      bone: 'frontal',
      nerve: 'supraorbital',
    },
  },
  {
    id: 'apanga',
    name: 'Apanga',
    nameSanskrit: 'आपांग',
    namePt: 'Apanga (Canto do Olho)',
    location: 'Outer canthus of eye',
    locationDescription: 'Outer corner of the eye',
    region: 'head',
    subRegion: 'face',
    dosha: 'pitta',
    element: 'agni',
    marmaType: 'agni',
    category: 'structural',
    associatedChakra: 'ajna',
    energyFlow: 'lateral',
    connections: ['temporal_lobe', 'lateral_vision'],
    symmetry: 'bilateral',
    vitalLevel: 3,
    anatomy: {
      nerve: 'zygomaticofacial',
      muscle: 'orbicularis_oculi',
    },
  },
  {
    id: 'vitapa',
    name: 'Vitapa',
    nameSanskrit: 'वितप',
    namePt: 'Vitapa (Cantos dos Pés)',
    location: 'Temple region lateral to eye',
    locationDescription: 'Depression at the outer corner of the eye',
    region: 'head',
    subRegion: 'face',
    dosha: 'kapha',
    element: 'prithvi',
    marmaType: 'soma',
    category: 'structural',
    energyFlow: 'lateral',
    connections: ['temporal_region', 'facial_muscles'],
    symmetry: 'bilateral',
    vitalLevel: 3,
    anatomy: {
      nerve: 'zygomaticofacial',
    },
  },
  {
    id: 'hridaya',
    name: 'Hridaya',
    nameSanskrit: 'हृदय',
    namePt: 'Hridaya (Coração)',
    location: 'Heart center',
    locationDescription: 'Center of the chest at heart region',
    region: 'chest',
    subRegion: 'heart',
    dosha: 'pitta',
    element: 'agni',
    marmaType: 'agni',
    category: 'vital',
    associatedChakra: 'anahata',
    associatedNadis: ['sushumna', 'idas', 'pingalas', 'hrdaya'],
    energyFlow: 'expanding',
    connections: ['heart', 'emotional_center', 'love'],
    therapeutic: ['heart_conditions', 'emotional_healing', 'circulation'],
    symmetry: 'midline',
    vitalLevel: 1,
    anatomy: {
      organ: 'heart',
      vessel: 'coronary_arteries',
      nerve: 'vagus',
    },
  },
  {
    id: 'apastambha',
    name: 'Apastambha',
    nameSanskrit: 'अपस्तम्भ',
    namePt: 'Apastambha (Abdômen Inferior)',
    location: 'Lower abdomen',
    locationDescription: 'Below the navel in lower abdomen',
    region: 'abdomen',
    subRegion: 'lower',
    dosha: 'kapha',
    element: 'prithvi',
    marmaType: 'soma',
    category: 'vital',
    associatedChakra: 'svadhisthana',
    associatedNadis: ['ida', 'pingala'],
    energyFlow: 'ascending',
    connections: ['reproductive', 'elimination', 'creativity'],
    symmetry: 'midline',
    vitalLevel: 2,
    anatomy: {
      organ: 'uterus_prostate',
      muscle: 'rectus_abdominis',
    },
  },
  {
    id: 'nabhi',
    name: 'Nabhi',
    nameSanskrit: 'नाभि',
    namePt: 'Nabhi (Umbigo)',
    location: 'Umbilicus',
    locationDescription: 'Center of the navel',
    region: 'abdomen',
    subRegion: 'center',
    dosha: 'pitta',
    element: 'agni',
    marmaType: 'agni',
    category: 'vital',
    associatedChakra: 'manipura',
    associatedNadis: ['sushumna', 'ida', 'pingala'],
    energyFlow: 'radiating',
    connections: ['digestive_fire', 'prana_distribution', 'core_strength'],
    therapeutic: ['digestive_issues', 'metabolism', 'energy_balance'],
    symmetry: 'midline',
    vitalLevel: 1,
    anatomy: {
      organ: 'small_intestine',
      vessel: 'umbilical_vessels_remnant',
      nerve: 'celiac_plexus',
    },
  },
  {
    id: 'garjhara',
    name: 'Garjhara',
    nameSanskrit: 'गर्ज्हर',
    namePt: 'Garjhara (Articulação do Joelho)',
    location: 'Knee joint',
    locationDescription: 'Center of the knee joint',
    region: 'lower_limb',
    subRegion: 'knee',
    dosha: 'vata',
    element: 'vayu',
    marmaType: 'shiva',
    category: 'structural',
    energyFlow: 'flexible',
    connections: ['mobility', 'circulation_lower'],
    symmetry: 'bilateral',
    vitalLevel: 2,
    anatomy: {
      bone: 'femur_tibia_junction',
      nerve: 'popliteal',
      muscle: 'quadriceps_hamstrings',
    },
  },
  {
    id: 'kukundara',
    name: 'Kukundara',
    nameSanskrit: 'कुकुन्दर',
    namePt: 'Kukundara (Lateral do Quadril)',
    location: 'Hip region',
    locationDescription: 'Lateral aspect of hip bone',
    region: 'pelvis',
    subRegion: 'hip',
    dosha: 'vata',
    element: 'vayu',
    marmaType: 'shiva',
    category: 'structural',
    associatedChakra: 'muladhara',
    energyFlow: 'grounding',
    connections: ['hip_joint', 'leg_mobility', 'stability'],
    symmetry: 'bilateral',
    vitalLevel: 2,
    anatomy: {
      bone: 'ilium',
      muscle: 'gluteus_medius',
      nerve: 'superior_gluteal',
    },
  },
];

// ============================================================
// MARMA REGIONS DATA
// ============================================================

const MARMA_REGIONS: MarmaRegion[] = [
  {
    id: 'head',
    name: 'Shiro Marma',
    namePt: 'Região da Cabeça',
    pointCount: 12,
    points: ['adhipati', 'shankha', 'utkshepa', 'avarta', 'stapani', 'apanga', 'vitapa'],
    significance: 'Seat of consciousness and vital life points',
  },
  {
    id: 'neck',
    name: 'Greeva Marma',
    namePt: 'Região do Pescoço',
    pointCount: 5,
    points: ['greeva'],
    significance: 'Gateway for prana and nadi flow',
  },
  {
    id: 'chest',
    name: 'Urah Marma',
    namePt: 'Região do Peito',
    pointCount: 8,
    points: ['hridaya', 'chida', 'hrid'],
    significance: 'Seat of prana and emotional center',
  },
  {
    id: 'abdomen',
    name: 'Udar Marma',
    namePt: 'Região Abdominal',
    pointCount: 12,
    points: ['nabhi', 'apastambha', 'kukshi'],
    significance: 'Digestive fire and energy distribution',
  },
  {
    id: 'pelvis',
    name: 'Kati Marma',
    namePt: 'Região Pélvica',
    pointCount: 10,
    points: ['kukundara', 'vrikkau', 'gulpha'],
    significance: 'Ground center and reproductive energy',
  },
  {
    id: 'upper_limb',
    name: 'Bahu Marma',
    namePt: 'Região do Membro Superior',
    pointCount: 22,
    points: ['kurca', 'kama'],
    significance: 'Action and manifestation energy',
  },
  {
    id: 'lower_limb',
    name: 'Sakthi Marma',
    namePt: 'Região do Membro Inferior',
    pointCount: 16,
    points: ['garjhara', 'indrabasti'],
    significance: 'Grounding and movement prana',
  },
];

// ============================================================
// MARMA CATEGORIES DATA
// ============================================================

const MARMA_CATEGORIES: MarmaCategory[] = [
  {
    id: 'vital',
    name: 'Param Marma',
    namePt: 'Pontos Vitais (Sala)',
    count: 20,
    description: 'Highest intensity vital points that can cause death if injured',
  },
  {
    id: 'structural',
    name: 'Ardha Marma',
    namePt: 'Pontos Estruturais (Metade)',
    count: 44,
    description: 'Structural points with moderate to high significance',
  },
  {
    id: 'lesser',
    name: 'Kalantara Marma',
    namePt: 'Pontos Menores (Menor)',
    count: 8,
    description: 'Minor points with lower vital significance',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getMarmaById(id: string): MarmaPoint | undefined {
  return MARMA_POINTS.find((m) => m.id === id);
}

function getMarmaByRegion(region: string): MarmaPoint[] {
  return MARMA_POINTS.filter((m) => m.region === region);
}

function getMarmaByDosha(dosha: string): MarmaPoint[] {
  return MARMA_POINTS.filter((m) => m.dosha.toLowerCase() === dosha.toLowerCase());
}

function getMarmaByChakra(chakra: string): MarmaPoint[] {
  return MARMA_POINTS.filter((m) => m.associatedChakra?.toLowerCase() === chakra.toLowerCase());
}

function getMarmaByType(marmaType: string): MarmaPoint[] {
  return MARMA_POINTS.filter((m) => m.marmaType.toLowerCase() === marmaType.toLowerCase());
}

function getVitalMarma(level: 1 | 2 | 3): MarmaPoint[] {
  return MARMA_POINTS.filter((m) => m.vitalLevel === level);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/marma/data
 * Retrieve marma point data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const region = searchParams.get('region');
    const dosha = searchParams.get('dosha');
    const chakra = searchParams.get('chakra');
    const type = searchParams.get('type');
    const vitalLevel = searchParams.get('vitalLevel');
    const includeRegions = searchParams.get('includeRegions');
    const includeCategories = searchParams.get('includeCategories');

    // Return single marma by ID
    if (id) {
      const marma = getMarmaById(id);
      if (!marma) {
        return NextResponse.json(
          { success: false, error: 'Marma point not found' },
          { status: 404 }
        );
      }

      const response: Record<string, unknown> = { success: true, data: marma };

      // Optionally include related data
      if (includeRegions === 'true') {
        response.regions = MARMA_REGIONS;
      }
      if (includeCategories === 'true') {
        response.categories = MARMA_CATEGORIES;
      }

      return NextResponse.json(response);
    }

    // Return marma by region
    if (region) {
      const filtered = getMarmaByRegion(region);
      return NextResponse.json({
        success: true,
        data: filtered,
        region,
        count: filtered.length,
      });
    }

    // Return marma by dosha
    if (dosha) {
      const filtered = getMarmaByDosha(dosha);
      return NextResponse.json({
        success: true,
        data: filtered,
        dosha,
        count: filtered.length,
      });
    }

    // Return marma by chakra
    if (chakra) {
      const filtered = getMarmaByChakra(chakra);
      return NextResponse.json({
        success: true,
        data: filtered,
        chakra,
        count: filtered.length,
      });
    }

    // Return marma by type
    if (type) {
      const filtered = getMarmaByType(type);
      return NextResponse.json({
        success: true,
        data: filtered,
        marmaType: type,
        count: filtered.length,
      });
    }

    // Return marma by vital level
    if (vitalLevel) {
      const level = parseInt(vitalLevel) as 1 | 2 | 3;
      if (level < 1 || level > 3) {
        return NextResponse.json(
          { success: false, error: 'Vital level must be 1, 2, or 3' },
          { status: 400 }
        );
      }
      const filtered = getVitalMarma(level);
      return NextResponse.json({
        success: true,
        data: filtered,
        vitalLevel: level,
        count: filtered.length,
      });
    }

    // Include regions if requested
    if (includeRegions === 'true') {
      return NextResponse.json({
        success: true,
        data: MARMA_POINTS,
        regions: MARMA_REGIONS,
        count: MARMA_POINTS.length,
      });
    }

    // Include categories if requested
    if (includeCategories === 'true') {
      return NextResponse.json({
        success: true,
        data: MARMA_POINTS,
        categories: MARMA_CATEGORIES,
        count: MARMA_POINTS.length,
      });
    }

    // Return all marma data
    return NextResponse.json({
      success: true,
      data: MARMA_POINTS,
      count: MARMA_POINTS.length,
      regions: MARMA_REGIONS,
      categories: MARMA_CATEGORIES,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch marma data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}