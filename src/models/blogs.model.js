const { mongoose } = require('../config/db');
const { getReadingTime } = require('../utils');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    body: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    state: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    read_count: {
      type: Number,
      default: 0,
    },
    reading_time: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
      },
    },
  }
);

// Pre-save middleware to update the reading time whenever the body changes
blogSchema.pre(/^(updateOne|save|findOneAndUpdate)/, function (next) {
  if (this.body) {
    this.reading_time = getReadingTime(this.body);
  }
  next();
});

//  Text index setup to optimize search
blogSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('blog', blogSchema);
