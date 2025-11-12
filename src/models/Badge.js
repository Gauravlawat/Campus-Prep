import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  icon: String,
  rarity: {
    type: String,
    enum: ['Common', 'Rare', 'Epic', 'Legendary'],
  },
  category: String,
  credits: Number,
});

export default mongoose.models.Badge || mongoose.model('Badge', badgeSchema);
