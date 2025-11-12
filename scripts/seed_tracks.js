// Seed sample LearningTrack documents directly via MongoDB driver
// Usage: set MONGODB_URI in your environment, then run: npm run seed:tracks

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

function trackDoc({ trackId, title, category, difficulty, estimatedDuration, tags, topics }) {
  return {
    trackId,
    title,
    description: `${title} curated path with hands-on practice and quizzes.`,
    category,
    difficulty,
    targetYear: [1, 2, 3, 4],
    estimatedDuration,
    prerequisiteTracks: [],
    topics,
    totalProblems: topics.reduce((acc, t) => acc + (t.subtopics?.reduce((a, s) => a + (s.problems?.length || 0), 0) || 0), 0),
    totalQuizzes: topics.reduce((acc, t) => acc + (t.quiz?.length || 0), 0),
    enrollmentCount: 0,
    completionRate: 0,
    averageRating: 4.8,
    tags,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function topic({ i, id, title, diff, subtopics }) {
  return {
    topicId: id,
    title,
    description: `${title} — key concepts and patterns`,
    order: i,
    estimatedTime: 4,
    difficulty: diff,
    subtopics,
    quiz: [],
    isLocked: i > 1,
    unlockCriteria: { prerequisiteTopics: i > 1 ? [subtopicIdFor(i - 1)] : [], minAccuracy: 0, minProblems: 0 },
  };
}

function subtopic({ id, title, concepts }) {
  return {
    subtopicId: id,
    title,
    concepts,
    problems: [],
    resources: [
      { type: 'article', title: `${title} guide`, url: 'https://example.com', duration: 10, difficulty: 'Beginner', isRecommended: true },
    ],
  };
}

function subtopicIdFor(n) { return `t${n}-st1`; }

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const col = db.collection('learningtracks');

  const existing = await col.countDocuments({ trackId: { $in: ['dsa_foundations', 'ml_starter'] } });
  if (existing > 0) {
    console.log('Sample tracks already present. Exiting.');
    await client.close();
    return;
  }

  const dsa = trackDoc({
    trackId: 'dsa_foundations',
    title: 'DSA Foundations',
    category: 'DSA',
    difficulty: 'Beginner',
    estimatedDuration: 28,
    tags: ['Arrays', 'Strings', 'Two Pointers', 'Hashing'],
    topics: [
      topic({ i: 1, id: 't1', title: 'Arrays & Strings', diff: 'Beginner', subtopics: [
        subtopic({ id: 't1-st1', title: 'Arrays Basics', concepts: ['iteration', 'prefix sums'] }),
        subtopic({ id: 't1-st2', title: 'Strings Basics', concepts: ['two pointers', 'frequency maps'] }),
      ] }),
      topic({ i: 2, id: 't2', title: 'Hashing', diff: 'Beginner', subtopics: [
        subtopic({ id: 't2-st1', title: 'Maps & Sets', concepts: ['hash map', 'hash set'] }),
      ] }),
      topic({ i: 3, id: 't3', title: 'Two Pointers', diff: 'Intermediate', subtopics: [
        subtopic({ id: 't3-st1', title: 'Classic Patterns', concepts: ['opposite ends', 'sliding window intro'] }),
      ] }),
    ],
  });

  const ml = trackDoc({
    trackId: 'ml_starter',
    title: 'Machine Learning Starter',
    category: 'ML',
    difficulty: 'Beginner',
    estimatedDuration: 21,
    tags: ['Python', 'Pandas', 'Models'],
    topics: [
      topic({ i: 1, id: 'm1', title: 'Python for Data', diff: 'Beginner', subtopics: [
        subtopic({ id: 'm1-st1', title: 'NumPy', concepts: ['ndarrays', 'vectorization'] }),
      ] }),
      topic({ i: 2, id: 'm2', title: 'Pandas Basics', diff: 'Beginner', subtopics: [
        subtopic({ id: 'm2-st1', title: 'DataFrames', concepts: ['indexing', 'groupby'] }),
      ] }),
    ],
  });

  await col.insertMany([dsa, ml]);
  console.log('Inserted sample tracks: dsa_foundations, ml_starter');
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
