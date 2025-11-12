import dbConnect from '@/lib/mongodb';
import LearningTrack from '@/models/LearningTrack';
import Problem from '@/models/Problem';
import UserProgress from '@/models/UserProgress';
import { authenticateToken } from '@/middleware/auth';

export default authenticateToken(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const { trackId, topicId } = req.query;
  try {
    await dbConnect();

    const track = await LearningTrack.findOne({ trackId }).lean();
    if (!track) return res.status(404).json({ success: false, message: 'Track not found' });

    const topic = track.topics.find(t => t.topicId === topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    // Collect problems from all subtopics and populate problem details
    const problemIds = (topic.subtopics || []).flatMap(st => st.problems || []);
    const problems = problemIds.length
      ? await Problem.find({ _id: { $in: problemIds } }).lean()
      : [];

    // Collect resources (flatten subtopic resources)
    const resources = (topic.subtopics || []).flatMap(st => st.resources || []);

    // Basic user progress for this topic
    const up = await UserProgress.findOne({ userId: req.user.id, trackId }).lean();
    let topicProgressPct = 0;
    if (up) {
      const tp = (up.topicProgress || []).find(tp => tp.topicId === topicId);
      if (tp) {
        const subs = tp.subtopicProgress || [];
        const done = subs.filter(s => s.isCompleted).length;
        topicProgressPct = subs.length ? Math.round((done / subs.length) * 100) : 0;
      }
    }

    // Related questions (use first 6 from problems list for now)
    const relatedQuestions = problems.slice(0, 6).map(p => ({ _id: p._id, title: p.title, problemId: p.problemId }));

    // AI intro content & suggestions (simple placeholders for now)
    const aiContent = {
      introduction: `Let’s explore ${topic.title}. I’ll walk you through key ideas, common pitfalls, and how to approach problems effectively.`,
    };
    const suggestions = {
      nextPrompt: `Given ${topic.title}, what is the most common strategy and when should I avoid it?`,
    };

    return res.status(200).json({
      success: true,
      data: {
        topic: {
          topicId: topic.topicId,
          title: topic.title,
          description: topic.description,
          resources,
          problems,
          aiContent,
          relatedQuestions,
        },
        userProgress: {
          currentTopicProgress: topicProgressPct,
        },
        suggestions,
      },
    });
  } catch (e) {
    console.error('Learn API error', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});
 
