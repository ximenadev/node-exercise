import mongoose, {
  type HydratedDocument,
  type Query,
  type Types,
} from 'mongoose';
import slugify from 'slugify';
import User from '../users/users.model';
import { GUIDE_ROLES } from '../users/users.constants';
import { RATING_MAX, RATING_MIN } from '../reviews/reviews.constants';
import '../reviews/reviews.model';
import {
  COORDINATES_MESSAGE,
  DEFAULT_RATINGS_AVERAGE,
  DIFFICULTIES,
  GEOJSON_POINT,
  LATITUDE_RANGE,
  LONGITUDE_RANGE,
  type Difficulty,
} from './tours.constants';

const inRange = (value: number, range: { min: number; max: number }) =>
  value >= range.min && value <= range.max;

const coordinatesField = {
  type: [Number],
  default: undefined,
  validate: {
    validator: (coordinates: number[]) =>
      coordinates.length === 2 &&
      inRange(coordinates[0], LONGITUDE_RANGE) &&
      inRange(coordinates[1], LATITUDE_RANGE),
    message: COORDINATES_MESSAGE,
  },
};

export interface IGeoPoint {
  type: typeof GEOJSON_POINT;
  coordinates: number[];
  address?: string;
  description?: string;
}

export interface ITourLocation extends IGeoPoint {
  day?: number;
}

export interface ITour {
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: Difficulty;
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
  startLocation?: IGeoPoint;
  locations: ITourLocation[];
  guides: Types.ObjectId[];
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
        values: DIFFICULTIES,
        message: `Difficulty is either: ${DIFFICULTIES.join(', ')}`,
      },
    },
    ratingsAverage: {
      type: Number,
      default: DEFAULT_RATINGS_AVERAGE,
      min: [RATING_MIN, `Rating must be above ${RATING_MIN.toFixed(1)}`],
      max: [RATING_MAX, `Rating must be below ${RATING_MAX.toFixed(1)}`],
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
    startLocation: {
      type: {
        type: String,
        enum: [GEOJSON_POINT],
      },
      coordinates: coordinatesField,
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: GEOJSON_POINT,
          enum: [GEOJSON_POINT],
        },
        coordinates: coordinatesField,
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      validate: {
        validator: async (ids: Types.ObjectId[]) => {
          const unique = new Set(ids.map(String));
          if (unique.size === 0) return true;
          const guides = await User.find({
            _id: { $in: [...unique] },
            role: { $in: GUIDE_ROLES },
          })
            .select('_id')
            .lean();
          return guides.length === unique.size;
        },
        message:
          'Every guide must be an existing, active user with the guide or lead-guide role',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ slug: 1 });

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

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
    this.where({ secretTour: { $ne: true } });
    this.start = Date.now();
  },
);

tourSchema.pre(/^(count|distinct)/, function (this: Query<unknown, ITour>) {
  this.where({ secretTour: { $ne: true } });
});

tourSchema.post(
  'findOneAndDelete',
  async function (doc: HydratedDocument<ITour> | null) {
    if (doc) await mongoose.model('Review').deleteMany({ tour: doc._id });
  },
);

// tourSchema.post(/^find/, function (this: { start: number }) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
// });

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function () {
  const pipeline = this.pipeline();
  const hideSecretTours = { $match: { secretTour: { $ne: true } } };

  if (pipeline[0] && '$geoNear' in pipeline[0])
    pipeline.splice(1, 0, hideSecretTours);
  else pipeline.unshift(hideSecretTours);
});

const Tour = mongoose.model<ITour>('Tour', tourSchema);
export default Tour;
