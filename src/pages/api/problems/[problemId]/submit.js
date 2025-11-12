import dbConnect from '@/lib/mongodb';
import Problem from '@/models/Problem';
import UserSubmission from '@/models/UserSubmission';
import { sendSuccess, sendError } from '@/utils/apiResponse';
import { authenticateToken } from '@/middleware/auth';
import { executeCode } from '@/utils/codeExecution';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { problemId } = req.query;
    const user = req.user; // This will be populated by the authenticateToken middleware
    const { code, language, testMode } = req.body;

    const problem = await Problem.findOne({ problemId });

    if (!problem) {
      return sendError(res, 'Problem not found', 404);
    }

    const executionResult = await executeCode(code, language, problemId, problem.testCases);

    if (!executionResult.success) {
        return sendError(res, 'Code execution failed', 500, executionResult.error);
    }

    const newSubmission = new UserSubmission({
        submissionId: executionResult.data.submissionId,
        userId: user._id,
        problemId: problem._id,
        code,
        language,
        status: executionResult.data.status,
        testCasesResults: executionResult.data.publicTestResults,
        executionStats: executionResult.data.executionResults,
        submissionTime: new Date(),
        timeTaken: executionResult.data.submissionMetrics.timeTakenToSolve,
        attempts: (await UserSubmission.countDocuments({ userId: user._id, problemId: problem._id })) + 1,
        isFirstAccepted: executionResult.data.status === 'Accepted' && (await UserSubmission.countDocuments({ userId: user._id, problemId: problem._id, status: 'Accepted' })) === 0,
        codeMetrics: executionResult.data.submissionMetrics.codeQualityScore,
        feedback: executionResult.data.feedback,
    });

    await newSubmission.save();

    sendSuccess(res, newSubmission, 'Submission successful');

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}

export default authenticateToken(handler);
