import dbConnect from '@/lib/mongodb';
import Problem from '@/models/Problem';
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
    const { code, language } = req.body;

    const problem = await Problem.findOne({ problemId });

    if (!problem) {
      return sendError(res, 'Problem not found', 404);
    }

    const publicTestCases = problem.testCases.filter(tc => !tc.isHidden);
    const executionResult = await executeCode(code, language, problemId, publicTestCases);

    if (!executionResult.success) {
        return sendError(res, 'Code execution failed', 500, executionResult.error);
    }

    sendSuccess(res, executionResult.data, 'Tests run successfully');

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}

export default authenticateToken(handler);
