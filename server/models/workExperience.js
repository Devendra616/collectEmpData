import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  companyName: String,
  role: String,
  startDate: Date,
  endDate: Date,
  responsibilities: String,
});

const workExperienceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  experiences: [experienceSchema],
});

const WorkExperience = mongoose.model('workExperience', workExperienceSchema);
export default WorkExperience;
