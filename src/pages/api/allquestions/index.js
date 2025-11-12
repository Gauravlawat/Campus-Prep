
import dbConnect from '../../../lib/mongodb';
import AllQuestion from '../../../models/AllQuestion';

export default async function handler(req, res) {
    const { method } = req;
    const { page = 1, limit = 100 } = req.query;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const questions = await AllQuestion.find({})
                    .limit(limit * 1)
                    .skip((page - 1) * limit)
                    .exec();
                
                const count = await AllQuestion.countDocuments();

                res.status(200).json({ 
                    success: true, 
                    data: questions, 
                    totalPages: Math.ceil(count / limit),
                    currentPage: page 
                });
            } catch (error) {
                res.status(400).json({ success: false });
            }
            break;
        default:
            res.status(400).json({ success: false });
            break;
    }
}
