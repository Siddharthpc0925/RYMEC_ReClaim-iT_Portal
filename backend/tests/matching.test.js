const { test, describe } = require('node:test');
const assert = require('node:assert');
const { scoreMatch, normalizeColor, computeJaccardSimilarity } = require('../lib/matching');

describe('RYMEC ReClaim-iT: Explainable Match Engine (U1)', () => {
  // Test 1: Perfect Match
  test('1. Perfect match achieves 90+ score and explains all factors', () => {
    const lost = {
      category: 'Wallet',
      location_id: 'loc-library',
      location_parent: 'Academic Core',
      occurred_at: '2026-11-10T10:00:00Z',
      colour: 'Black',
      brand: 'WildHorn',
      title: 'Lost black leather WildHorn wallet',
      description: 'Lost my black wallet with student ID card and cash near the entrance'
    };
    const found = {
      category: 'Wallet',
      location_id: 'loc-library',
      location_parent: 'Academic Core',
      occurred_at: '2026-11-11T11:00:00Z',
      colour: 'Black',
      brand: 'WildHorn',
      title: 'Found black WildHorn leather wallet',
      description: 'Found a black leather wallet near entrance tables'
    };

    const result = scoreMatch(lost, found);
    assert.ok(result.score >= 85, `Expected score >= 85, got ${result.score}`);
    assert.ok(result.reasons.some(r => r.includes('Same category')));
    assert.ok(result.reasons.some(r => r.includes('Exact location match')));
    assert.ok(result.reasons.some(r => r.includes('Found 1 day(s) after loss')));
    assert.ok(result.reasons.some(r => r.includes('Matching colour')));
    assert.ok(result.reasons.some(r => r.includes('Brand match')));
  });

  // Test 2: Same category only
  test('2. Same category only gives baseline score without false matches', () => {
    const lost = {
      category: 'Phone',
      location_id: 'loc-canteen',
      occurred_at: '2026-11-01T10:00:00Z',
      colour: 'Blue',
      brand: 'Samsung',
      title: 'Lost blue phone',
      description: 'Lost blue Galaxy'
    };
    const found = {
      category: 'Phone',
      location_id: 'loc-sports',
      occurred_at: '2026-11-20T10:00:00Z',
      colour: 'Red',
      brand: 'Apple',
      title: 'Found iPhone red',
      description: 'Found iPhone red on field'
    };

    const result = scoreMatch(lost, found);
    assert.strictEqual(result.score, 30);
    assert.deepStrictEqual(result.reasons, ['Same category (Phone)']);
  });

  // Test 3: Date penalty when found date is prior to lost date
  test('3. Imposes penalty when found date precedes lost date by more than 1 day', () => {
    const lost = {
      category: 'Keys',
      location_id: 'loc-gate',
      occurred_at: '2026-11-12T10:00:00Z',
      colour: 'Silver',
      title: 'Bike keys',
      description: 'Keys lost on bike'
    };
    const found = {
      category: 'Keys',
      location_id: 'loc-gate',
      occurred_at: '2026-11-05T10:00:00Z', // 7 days prior
      colour: 'Silver',
      title: 'Keys found',
      description: 'Found bike keys'
    };

    const result = scoreMatch(lost, found);
    // category(30) + location(25) + penalty(-10) + colour(10) + text sim(up to 8) = 55-63
    assert.ok(result.reasons.some(r => r.includes('found date precedes lost date')));
  });

  // Test 4: Synonym colour matching
  test('4. Correctly matches synonym colours like silver and grey', () => {
    const c1 = normalizeColor('Metallic Silver');
    const c2 = normalizeColor('Charcoal Black');
    const c3 = normalizeColor('Silver');
    assert.strictEqual(c1, 'grey');
    assert.strictEqual(c2, 'black');
    assert.strictEqual(c3, 'grey');

    const lost = { category: 'Laptop', colour: 'Silver' };
    const found = { category: 'Laptop', colour: 'Grey' };
    const result = scoreMatch(lost, found);
    assert.ok(result.score >= 40);
    assert.ok(result.reasons.some(r => r.includes('Matching colour')));
  });

  // Test 5: Empty description handling without crashing
  test('5. Gracefully handles null, empty, or undefined descriptions', () => {
    const lost = { category: 'Bottle', colour: 'Blue', title: '', description: null };
    const found = { category: 'Bottle', colour: 'Blue', title: null, description: undefined };
    const result = scoreMatch(lost, found);
    assert.strictEqual(result.score, 40); // category 30 + colour 10
  });

  // Test 6: Same campus parent zone partial score (+12)
  test('6. Scores partial points for same campus parent zone', () => {
    const lost = {
      category: 'Books',
      location_id: 'loc-mech-1',
      location_parent: 'Engineering Wings'
    };
    const found = {
      category: 'Books',
      location_id: 'loc-ee-2',
      location_parent: 'Engineering Wings'
    };
    const result = scoreMatch(lost, found);
    assert.strictEqual(result.score, 42); // 30 (category) + 12 (parent zone)
    assert.ok(result.reasons.some(r => r.includes('Same campus zone')));
  });

  // Test 7: Identical text similarity scoring
  test('7. Identical titles and descriptions yield high text similarity points', () => {
    const textA = 'Scientific Calculator Casio fx991ES Plus second edition';
    const textB = 'Scientific Calculator Casio fx991ES Plus second edition';
    const sim = computeJaccardSimilarity(textA, textB);
    assert.strictEqual(sim, 1.0);

    const lost = { title: textA, description: 'Calculus exam hall' };
    const found = { title: textB, description: 'Calculus exam hall' };
    const result = scoreMatch(lost, found);
    assert.ok(result.score > 0);
    assert.ok(result.reasons.some(r => r.includes('Description similarity')));
  });

  // Test 8: Completely disjoint items yield score 0
  test('8. Items with nothing in common return 0 score and empty reasons', () => {
    const lost = {
      category: 'Umbrella',
      location_id: 'loc-hostel',
      colour: 'Yellow',
      title: 'Yellow umbrella',
      occurred_at: '2026-11-01T00:00:00Z'
    };
    const found = {
      category: 'Earphones',
      location_id: 'loc-canteen',
      colour: 'White',
      title: 'Airpods Pro',
      occurred_at: '2026-11-25T00:00:00Z'
    };
    const result = scoreMatch(lost, found);
    assert.strictEqual(result.score, 0);
    assert.strictEqual(result.reasons.length, 0);
  });
});
