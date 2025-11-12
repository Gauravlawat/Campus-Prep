import dbConnect from '@/lib/mongodb';
import LearningTrack from '@/models/LearningTrack';
import { sendSuccess, sendError } from '@/utils/apiResponse';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { category, difficulty, year, search } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    if (year && year !== 'all') {
      filter.targetYear = { $in: [parseInt(year)] };
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const tracks = await LearningTrack.find(filter);

    const categories = await LearningTrack.distinct('category');
    const difficulties = await LearningTrack.distinct('difficulty');

    sendSuccess(res, {
      tracks,
      totalTracks: tracks.length,
      categories,
      difficulties,
      filters: {
        appliedFilters: req.query,
      },
    });

  } catch (error) {
    console.error(error);
    sendError(res, 'Internal server error');
  }
}
