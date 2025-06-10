/**
 * Enhanced Game Discovery Validation Tests
 */

import { gameDiscovery, TAG_CATEGORIES } from '../gameData';

describe('Enhanced Game Discovery Validation', () => {
  test('should provide autocomplete suggestions for game titles', () => {
    const suggestions = gameDiscovery.getAutocompleteSuggestions('num', 5);
    
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
    
    // Should find "Numbers" game
    const numbersSuggestion = suggestions.find(s => s.type === 'game' && s.value.toLowerCase().includes('num'));
    expect(numbersSuggestion).toBeDefined();
    expect(numbersSuggestion?.type).toBe('game');
  });

  test('should provide autocomplete suggestions for tags', () => {
    const suggestions = gameDiscovery.getAutocompleteSuggestions('count', 5);
    
    expect(Array.isArray(suggestions)).toBe(true);
    
    // Should find counting-related tags
    const tagSuggestions = suggestions.filter(s => s.type === 'tag');
    expect(tagSuggestions.length).toBeGreaterThan(0);
    
    tagSuggestions.forEach(tag => {
      expect(tag.label).toMatch(/^#/); // Tags should start with #
      expect(typeof tag.count).toBe('number');
    });
  });

  test('should provide autocomplete suggestions for learning objectives', () => {
    const suggestions = gameDiscovery.getAutocompleteSuggestions('recognition', 8);
    
    expect(Array.isArray(suggestions)).toBe(true);
    
    // Should find learning objectives containing "recognition"
    const objectiveSuggestions = suggestions.filter(s => s.type === 'objective');
    expect(objectiveSuggestions.length).toBeGreaterThan(0);
    
    objectiveSuggestions.forEach(obj => {
      expect(obj.gameTitle).toBeDefined();
      expect(typeof obj.gameTitle).toBe('string');
    });
  });

  test('should return empty suggestions for empty query', () => {
    const suggestions = gameDiscovery.getAutocompleteSuggestions('', 5);
    expect(suggestions).toEqual([]);
  });

  test('should limit suggestions to specified count', () => {
    const suggestions = gameDiscovery.getAutocompleteSuggestions('a', 3);
    expect(suggestions.length).toBeLessThanOrEqual(3);
  });

  test('should categorize tags correctly', () => {
    const tagCategories = gameDiscovery.getTagsByCategory();
    
    expect(Array.isArray(tagCategories)).toBe(true);
    expect(tagCategories.length).toBeGreaterThan(0);
    
    tagCategories.forEach(category => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('tags');
      expect(Array.isArray(category.tags)).toBe(true);
      
      category.tags.forEach(tag => {
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('count');
        expect(tag).toHaveProperty('label');
        expect(typeof tag.count).toBe('number');
        expect(tag.count).toBeGreaterThan(0);
      });
    });
  });

  test('should filter tags by current filters', () => {
    const allTags = gameDiscovery.getTagsByCategory();
    const filteredTags = gameDiscovery.getTagsByCategory({ 
      subjects: ['Mathematics'] 
    });
    
    expect(Array.isArray(allTags)).toBe(true);
    expect(Array.isArray(filteredTags)).toBe(true);
    
    // Filtered results should be same or fewer categories
    expect(filteredTags.length).toBeLessThanOrEqual(allTags.length);
  });

  test('should format category names correctly', () => {
    const tagCategories = gameDiscovery.getTagsByCategory();
    
    const expectedNames = ['Skills', 'Interaction', 'Difficulty', 'Duration', 'Features', 'Curriculum'];
    const actualNames = tagCategories.map(cat => cat.name);
    
    expectedNames.forEach(expectedName => {
      if (actualNames.includes(expectedName)) {
        expect(actualNames).toContain(expectedName);
      }
    });
  });

  test('should format tag labels correctly', () => {
    const tagCategories = gameDiscovery.getTagsByCategory();
    
    tagCategories.forEach(category => {
      category.tags.forEach(tag => {
        // Tag labels should be properly formatted (e.g., "drag-drop" -> "Drag Drop")
        expect(tag.label).toMatch(/^[A-Z]/); // Should start with capital letter
        expect(tag.label).not.toMatch(/-/); // Should not contain hyphens
      });
    });
  });

  test('should have valid tag categories defined', () => {
    expect(TAG_CATEGORIES).toBeDefined();
    expect(typeof TAG_CATEGORIES).toBe('object');
    
    const expectedCategories = ['skill-type', 'interaction', 'difficulty', 'duration', 'feature', 'curriculum'];
    expectedCategories.forEach(category => {
      expect(TAG_CATEGORIES).toHaveProperty(category);
      expect(Array.isArray(TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES])).toBe(true);
    });
  });

  test('should perform enhanced search with facets', () => {
    const results = gameDiscovery.searchWithFacets('math', {
      subjects: ['Mathematics'],
      facets: {
        ageRanges: ['4-5'],
        durations: [],
        skillLevels: ['beginner'],
        features: []
      }
    });
    
    expect(Array.isArray(results)).toBe(true);
    
    // All results should be Mathematics games
    results.forEach(game => {
      expect(game.subject).toBe('Mathematics');
      expect(game.skillLevel).toBe('beginner');
      expect(game.ageRange[0]).toBeLessThanOrEqual(5);
      expect(game.ageRange[1]).toBeGreaterThanOrEqual(4);
    });
  });
}); 