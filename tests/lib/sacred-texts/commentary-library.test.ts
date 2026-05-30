/**
 * Commentary Library Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getCommentary,
  getCommentaryByText,
  getCommentaryBySchool,
  getScholars,
  getScholarById,
  type Commentary,
  type Scholar,
} from '@/lib/sacred-texts/commentary-library';

describe('Commentary Library', () => {
  describe('getCommentary', () => {
    it('should return an array of commentaries', () => {
      const commentaries = getCommentary();
      expect(Array.isArray(commentaries)).toBe(true);
      expect(commentaries.length).toBeGreaterThan(0);
    });

    it('should return a copy of the commentaries array', () => {
      const commentaries1 = getCommentary();
      const commentaries2 = getCommentary();
      expect(commentaries1).not.toBe(commentaries2);
    });

    it('should contain commentaries with required fields', () => {
      const commentaries = getCommentary();
      commentaries.forEach((c: Commentary) => {
        expect(c).toHaveProperty('id');
        expect(c).toHaveProperty('textId');
        expect(c).toHaveProperty('scholar');
        expect(c).toHaveProperty('school');
        expect(c).toHaveProperty('note');
      });
    });
  });

  describe('getCommentaryByText', () => {
    it('should return commentaries for a valid text ID', () => {
      const commentaries = getCommentaryByText('psalm-23');
      expect(Array.isArray(commentaries)).toBe(true);
      expect(commentaries.length).toBeGreaterThan(0);
      commentaries.forEach((c: Commentary) => {
        expect(c.textId).toBe('psalm-23');
      });
    });

    it('should return empty array for unknown text ID', () => {
      const commentaries = getCommentaryByText('non-existent-text');
      expect(Array.isArray(commentaries)).toBe(true);
      expect(commentaries.length).toBe(0);
    });

    it('should return commentaries for Quran texts', () => {
      const commentaries = getCommentaryByText('fatiha');
      expect(commentaries.length).toBeGreaterThan(0);
      commentaries.forEach((c: Commentary) => {
        expect(c.school).toBe('sufi');
      });
    });

    it('should return commentaries for Vedic texts', () => {
      const commentaries = getCommentaryByText('bhagavad-gita-1');
      expect(commentaries.length).toBeGreaterThan(0);
      commentaries.forEach((c: Commentary) => {
        expect(c.school).toBe('vedic');
      });
    });

    it('should return commentaries for Zen texts', () => {
      const commentaries = getCommentaryByText('heart-sutra');
      expect(commentaries.length).toBeGreaterThan(0);
      commentaries.forEach((c: Commentary) => {
        expect(c.school).toBe('zen');
      });
    });
  });

  describe('getCommentaryBySchool', () => {
    it('should return commentaries for rabbinic school', () => {
      const commentaries = getCommentaryBySchool('rabbinic');
      expect(Array.isArray(commentaries)).toBe(true);
      expect(commentaries.length).toBeGreaterThan(0);
      commentaries.forEach((c: Commentary) => {
        expect(c.school).toBe('rabbinic');
      });
    });

    it('should return commentaries for patristic school', () => {
      const commentaries = getCommentaryBySchool('patristic');
      expect(commentaries.length).toBeGreaterThan(0);
      commentaries.forEach((c: Commentary) => {
        expect(c.school).toBe('patristic');
      });
    });

    it('should return commentaries for sufi school', () => {
      const commentaries = getCommentaryBySchool('sufi');
      expect(commentaries.length).toBeGreaterThan(0);
      commentaries.forEach((c: Commentary) => {
        expect(c.school).toBe('sufi');
      });
    });

    it('should return commentaries for vedic school', () => {
      const commentaries = getCommentaryBySchool('vedic');
      expect(commentaries.length).toBeGreaterThan(0);
      commentaries.forEach((c: Commentary) => {
        expect(c.school).toBe('vedic');
      });
    });

    it('should return commentaries for zen school', () => {
      const commentaries = getCommentaryBySchool('zen');
      expect(commentaries.length).toBeGreaterThan(0);
      commentaries.forEach((c: Commentary) => {
        expect(c.school).toBe('zen');
      });
    });

    it('should return empty array for unknown school', () => {
      const commentaries = getCommentaryBySchool('unknown-school');
      expect(Array.isArray(commentaries)).toBe(true);
      expect(commentaries.length).toBe(0);
    });
  });
});

describe('Scholar Library', () => {
  describe('getScholars', () => {
    it('should return an array of scholars', () => {
      const scholars = getScholars();
      expect(Array.isArray(scholars)).toBe(true);
      expect(scholars.length).toBeGreaterThan(0);
    });

    it('should return a copy of the scholars array', () => {
      const scholars1 = getScholars();
      const scholars2 = getScholars();
      expect(scholars1).not.toBe(scholars2);
    });

    it('should contain scholars with required fields', () => {
      const scholars = getScholars();
      scholars.forEach((s: Scholar) => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('name');
        expect(s).toHaveProperty('tradition');
        expect(s).toHaveProperty('period');
      });
    });

    it('should include multiple traditions', () => {
      const scholars = getScholars();
      const traditions = new Set(scholars.map((s: Scholar) => s.tradition));
      expect(traditions.size).toBeGreaterThan(1);
    });
  });

  describe('getScholarById', () => {
    it('should return a scholar for a valid ID', () => {
      const scholar = getScholarById('rabbinic');
      expect(scholar).toBeDefined();
      expect(scholar?.id).toBe('rabbinic');
      expect(scholar?.name).toBe('Rabbinic Scholars');
      expect(scholar?.tradition).toBe('Jewish');
    });

    it('should return a scholar for sufi ID', () => {
      const scholar = getScholarById('sufi');
      expect(scholar).toBeDefined();
      expect(scholar?.id).toBe('sufi');
      expect(scholar?.tradition).toBe('Islamic');
    });

    it('should return a scholar for vedic ID', () => {
      const scholar = getScholarById('vedic');
      expect(scholar).toBeDefined();
      expect(scholar?.id).toBe('vedic');
      expect(scholar?.tradition).toBe('Hindu');
    });

    it('should return a scholar for zen ID', () => {
      const scholar = getScholarById('zen');
      expect(scholar).toBeDefined();
      expect(scholar?.id).toBe('zen');
      expect(scholar?.tradition).toBe('Buddhist');
    });

    it('should return undefined for unknown ID', () => {
      const scholar = getScholarById('unknown-scholar');
      expect(scholar).toBeUndefined();
    });
  });
});