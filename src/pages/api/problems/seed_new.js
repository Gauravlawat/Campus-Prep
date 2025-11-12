import dbConnect from '../../../lib/mongodb';
import Problem from '../../../models/Problem';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  await dbConnect();

  try {
    const filePath = path.join(process.cwd(), 'leetcode_top150_data_cleaned.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const problems = JSON.parse(jsonData);

    await Problem.deleteMany({});
    await Problem.insertMany(problems);

    res.status(200).json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
