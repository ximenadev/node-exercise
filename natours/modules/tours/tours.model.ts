import mongoose, { type HydratedDocument, type Query } from 'mongoose';
import slugify from 'slugify';

export interface ITour {
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
  startDates: Date[];
  secretTour: boolean;
}

const tourSchema = new mongoose.Schema<ITour>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // On create `this` is the doc; on update it is the Query, so read the price from the update payload
        validator: function (this: ITour | Query<unknown, ITour>, val: number) {
          if (this instanceof mongoose.Query) {
            const update = this.getUpdate() as {
              price?: number;
              $set?: { price?: number };
            } | null;
            const price = update?.price ?? update?.$set?.price;
            return price === undefined || val < price;
          }
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function (
  this: HydratedDocument<ITour>,
) {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
});

// tourSchema.post('save', function (doc: { slug?: string; name: string }) {
//   console.log(doc);
// });

// QUERY MIDDLEWARE
tourSchema.pre(
  /^find/,
  function (this: Query<unknown, ITour> & { start: number }) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
  },
);

// tourSchema.post(/^find/, function (this: { start: number }) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
// });

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});

const Tour = mongoose.model<ITour>('Tour', tourSchema);
export default Tour;
