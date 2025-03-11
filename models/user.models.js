import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isManager:{type:Boolean,default:false},
  isResolver:{type:Boolean,default:false},
  role: { type: String, enum: ['SuperAdmin','Admin', 'User'], default: 'User' },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
