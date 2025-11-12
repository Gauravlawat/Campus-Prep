import dbConnect from '../../../lib/mongodb';
import Problem from '../../../models/Problem';

export default async function handler(req, res) {
  await dbConnect();

  try {
    const problems = await Problem.find({});
    problems.forEach(problem => {
      console.log("Problem ID from DB (all questions):", problem.problemId);
    });
    
    res.status(200).json({ success: true, data: problems });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
