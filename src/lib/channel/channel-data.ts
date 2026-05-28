// Channel data for spiritual communication channels

export interface ChannelData {
  id: string;
  name: string;
  type: string;
  description: string;
  frequency: number;
  active: boolean;
  timestamp: number;
}

export const CHANNEL_DATASET: ChannelData[] = [
  {
    id: 'channel-001',
    name: 'Sacred Breath',
    type: 'breathing',
    description: 'Channel for breath-based spiritual connection',
    frequency: 0.5,
    active: true,
    timestamp: Date.now(),
  },
  {
    id: 'channel-002',
    name: 'Meditation Path',
    type: 'meditation',
    description: 'Channel for deep meditation and stillness',
    frequency: 0.3,
    active: true,
    timestamp: Date.now(),
  },
  {
    id: 'channel-003',
    name: 'Intuition Link',
    type: 'intuition',
    description: 'Channel for intuitive guidance and insights',
    frequency: 0.7,
    active: true,
    timestamp: Date.now(),
  },
  {
    id: 'channel-004',
    name: 'Ancestral Wave',
    type: 'ancestral',
    description: 'Channel for connecting with ancestral wisdom',
    frequency: 0.4,
    active: true,
    timestamp: Date.now(),
  },
  {
    id: 'channel-005',
    name: 'Cosmic Stream',
    type: 'cosmic',
    description: 'Channel for cosmic energy and universal connection',
    frequency: 0.6,
    active: true,
    timestamp: Date.now(),
  },
];

export function getData(): ChannelData[] {
  return [...CHANNEL_DATASET];
}