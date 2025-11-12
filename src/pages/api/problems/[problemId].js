import dbConnect from '@/lib/mongodb';
import Problem from '@/models/Problem';
import AllQuestion from '@/models/AllQuestion';
import UserSubmission from '@/models/UserSubmission';
import { sendSuccess, sendError } from '@/utils/apiResponse';
import { optionalAuth } from '@/middleware/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { problemId } = req.query;
    const user = req.user; // This will be populated by the optionalAuth middleware

    let problem = await Problem.findOne({ problemId });

    if (!problem) {
        problem = await AllQuestion.findOne({ problemId });
    }

    if (!problem) {
      return sendError(res, 'Problem not found', 404);
    }

    let userProgress = null;
    if (user) {
        const submissions = await UserSubmission.find({ userId: user._id, problemId: problem._id }).sort({ submissionTime: -1 });
        if (submissions.length > 0) {
            userProgress = {
                attempts: submissions.length,
                isAccepted: submissions.some(s => s.status === 'Accepted'),
                bestSubmission: submissions.find(s => s.status === 'Accepted'),
                firstAcceptedAt: submissions.find(s => s.status === 'Accepted')?.submissionTime,
                totalTimeSpent: submissions.reduce((acc, s) => acc + s.timeTaken, 0),
                bookmarked: false, // This needs a separate mechanism
                notes: '', // This needs a separate mechanism
            };
        }
    }
    
    // For now, I will return mock data for some fields
    let cleanedDescription = problem.description;

    // Remove Example sections
    cleanedDescription = cleanedDescription.replace(/Example \d+:\s*[\s\S]*?(?=(?:Example \d+:|Constraints:|Follow up:|$))/g, '');
    // Remove Constraints section
    cleanedDescription = cleanedDescription.replace(/Constraints:\s*[\s\S]*?(?=(?:Example \d+:|Follow up:|$))/g, '');
    // Remove Follow up section
    cleanedDescription = cleanedDescription.replace(/Follow up:\s*[\s\S]*?$/g, '');

    // Handle markdown-like formatting
    cleanedDescription = cleanedDescription.replace(/\n\n/g, '<br /><br />');
    cleanedDescription = cleanedDescription.replace(/\*\*(.*?)\*\*/g, ' <strong>$1</strong> ');
    cleanedDescription = cleanedDescription.replace(/\*(.*?)\*/g, ' <em>$1</em> ');
    cleanedDescription = cleanedDescription.replace(/`(.*?)`/g, ' <code>$1</code> ');

    // Trim whitespace from the beginning and end
    cleanedDescription = cleanedDescription.trim();

    const problemData = {
        problemId: problem.problemId,
        title: problem.title,
        description: cleanedDescription,
        difficulty: problem.difficulty,
        topics: problem.topics,
        subtopics: problem.subtopics,
        companies: problem.companies,
        frequency: problem.frequency,
        constraints: problem.constraints,
        examples: problem.examples,
        hints: problem.hints,
        userStats: {
            totalAttempts: 15432,
            acceptedSubmissions: 12891,
            acceptanceRate: 83.5,
            averageTimeToSolve: 18,
        },
        userProgress,
        solutions: problem.solutions,
        relatedProblems: problem.relatedProblems,
    };
    console.log(problemData);

    sendSuccess(res, problemData);

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}

export default optionalAuth(handler);
