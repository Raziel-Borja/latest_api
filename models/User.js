import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // No necesitamos modificarlo
  kills: { type: Number, default: 0 },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
