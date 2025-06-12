# Learning Progression Test Plan

## Test Objectives
Validate that the learning progression system correctly tracks and advances user skills based on game performance.

## Test Scenarios

### 1. Basic Skill Advancement
```typescript
// Test Steps:
1. Select "My Child" avatar
2. Play "Numbers" game with 60% score (6/10)
3. Check learning_progress table for initial skill level
4. Play again with 80% score (8/10)
5. Verify mastery score calculation
6. Play third time with 90% score (9/10)
7. Check for skill level advancement

// Expected Results:
- Initial skill level: 'beginner'
- Mastery score progression: 60 → 74 → 85
- Skill level advancement to 'intermediate' after third session
```

### 2. Subject-Specific Progression
```typescript
// Test Steps:
1. Select "Math Enthusiast" avatar
2. Play multiple math games with varying scores
3. Check subject-specific skill levels
4. Verify learning objectives tracking

// Expected Results:
- Math-specific skill level advances faster
- Learning objectives properly tracked
- Subject preferences updated in analytics
```

### 3. Cross-Subject Learning
```typescript
// Test Steps:
1. Select "Consistent Player" avatar
2. Play games across different subjects
3. Track overall learning velocity
4. Check recommendation adjustments

// Expected Results:
- Balanced skill development across subjects
- Learning velocity calculated correctly
- Recommendations reflect cross-subject progress
```

## Database Validation Queries

### Check Skill Level Distribution
```sql
SELECT 
  skill_level,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM learning_progress 
GROUP BY skill_level;
```

### Verify Mastery Score Calculations
```sql
SELECT 
  avatar_id,
  game_type,
  mastery_score,
  skill_level,
  created_at
FROM learning_progress 
WHERE avatar_id = '[test-avatar-id]'
ORDER BY created_at DESC;
```

### Check Learning Objectives Progress
```sql
SELECT 
  avatar_id,
  game_type,
  learning_objectives_met,
  skill_level
FROM learning_progress 
WHERE avatar_id = '[test-avatar-id]'
ORDER BY created_at DESC;
```

## Success Criteria
- [ ] Skill levels advance appropriately based on performance
- [ ] Mastery scores calculate correctly using weighted formula
- [ ] Learning objectives are properly tracked and updated
- [ ] Cross-subject progress is accurately reflected
- [ ] Recommendations adjust based on skill progression
- [ ] Database queries perform within acceptable time limits 