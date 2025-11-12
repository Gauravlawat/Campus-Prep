import mongoose from 'mongoose';

// Compute per-topic and overall progress metrics using LearningTrack, UserProgress, and (optionally) UserSubmission aggregates
export function computeTrackMetrics({ track, userProgress, submissionsByProblemId = {} }) {
  const topics = (track?.topics || []).slice().sort((a,b)=> (a.order||0)-(b.order||0));
  const topicMetrics = {};

  let totalSubtopics = 0;
  let totalSubtopicsDone = 0;

  for (const t of topics) {
    const subtopics = t.subtopics || [];
    const tp = userProgress?.topicProgress?.find(x => x.topicId === t.topicId);
    const subtopicProgress = tp?.subtopicProgress || [];

    const totalProblems = subtopics.reduce((acc, s) => acc + (s.problems?.length || 0), 0);
    const solvedProblemIds = new Set();
    let attempts = 0;
    let accepted = 0;
    let totalTimeMin = 0;
    let completedSubtopics = 0;

    // Aggregate from submissions
    for (const s of subtopics) {
      const probs = s.problems || [];
      let subSolved = 0;
      for (const pid of probs) {
        const key = String(pid);
        const list = submissionsByProblemId[key] || [];
        attempts += list.length;
        if (list.length > 0) {
          const timeSum = list.reduce((a,b)=> a + (b.timeTaken||0), 0);
          totalTimeMin += timeSum;
        }
        if (list.some(sub => sub.status === 'Accepted')) {
          accepted += 1;
          solvedProblemIds.add(key);
          subSolved += 1;
        }
      }
      // consider subtopic completed if all its problems have an Accepted
      const totalInSub = probs.length;
      const isCompleted = totalInSub > 0 ? subSolved === totalInSub : (subtopicProgress.find(p => p.subtopicId === s.subtopicId)?.isCompleted || false);
      if (isCompleted) completedSubtopics += 1;
    }

    const totalSub = subtopics.length;
    totalSubtopics += totalSub;
    totalSubtopicsDone += completedSubtopics;

    const progressPct = totalSub > 0 ? Math.round((completedSubtopics / totalSub) * 100) : 0;
    const accuracyPct = attempts > 0 ? Math.round((accepted / attempts) * 100) : 0;
    const avgTimeMin = accepted > 0 ? Math.round(totalTimeMin / Math.max(accepted,1)) : 0;

    topicMetrics[t.topicId] = {
      progressPct,
      accuracyPct,
      avgTimeMin,
      completedSubtopics,
      totalSubtopics: totalSub,
      solvedProblems: solvedProblemIds.size,
      totalProblems,
    };
  }

  const overallPct = totalSubtopics > 0 ? Math.round((totalSubtopicsDone / totalSubtopics) * 100) : (userProgress?.overallProgress || 0);
  return { topicMetrics, overallPct };
}
