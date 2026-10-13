import type { Model, PopulateOptions } from 'mongoose';
import { AppError } from './appError';
import { catchAsync } from './catchAsync';
import { APIFeatures, QueryString } from './apiFeatures';

type AnyModel<T> = Model<T, object, object>;

type Populate = PopulateOptions | PopulateOptions[];

type FactoryOptions = { populate?: Populate };

type Populatable = {
  projection(): object | null | undefined;
  populate(options: PopulateOptions): unknown;
};

const resourceName = <T>(Doc: AnyModel<T>) => Doc.modelName.toLowerCase();

const applyPopulate = (query: Populatable, populate?: Populate) => {
  if (!populate) return;

  const projection = query.projection() ?? {};
  const pickedFields = Object.values(projection).some(value => value);

  for (const option of [populate].flat()) {
    if (!pickedFields || option.path in projection) query.populate(option);
  }
};

export const getOne = <T>(Doc: AnyModel<T>, options: FactoryOptions = {}) =>
  catchAsync(async (req, res, next) => {
    const name = resourceName(Doc);
    const query = Doc.findById(req.params.id);
    applyPopulate(query, options.populate);

    const doc = await query;
    if (!doc) return next(new AppError(`No ${name} found with that ID`, 404));

    res.status(200).json({ status: 'success', data: { [name]: doc } });
  });

export const createOne = <T>(Doc: AnyModel<T>) =>
  catchAsync(async (req, res, next) => {
    const name = resourceName(Doc);
    const doc = await Doc.create(req.body);

    res.status(201).json({ status: 'success', data: { [name]: doc } });
  });

export const updateOne = <T>(Doc: AnyModel<T>, options: FactoryOptions = {}) =>
  catchAsync(async (req, res, next) => {
    const name = resourceName(Doc);
    const query = Doc.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    applyPopulate(query, options.populate);

    const doc = await query;
    if (!doc) return next(new AppError(`No ${name} found with that ID`, 404));

    res.status(200).json({ status: 'success', data: { [name]: doc } });
  });

export const deleteOne = <T>(Doc: AnyModel<T>) =>
  catchAsync(async (req, res, next) => {
    const doc = await Doc.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`No ${resourceName(Doc)} found with that ID`, 404),
      );
    }

    res.status(204).send();
  });

export const getAllWithFeatures = <T>(
  Doc: AnyModel<T>,
  options: FactoryOptions = {},
) =>
  catchAsync(async (req, res, next) => {
    const name = resourceName(Doc);
    const queryString = { ...req.query, ...res.locals.query } as QueryString;

    const features = new APIFeatures(
      Doc.find(res.locals.filter ?? {}),
      queryString,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    applyPopulate(features.query, options.populate);

    const results = await features.query;

    res.status(200).json({
      status: 'success',
      count: results.length,
      data: { [`${name}s`]: results },
    });
  });
