import type { Request, Response } from 'express';
import Tour from './tours.model';

export const getAllTours = async (req: Request, res: Response) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`,
    );
    const parsedQuery = JSON.parse(queryStr);

    const query = Tour.find(parsedQuery);

    const tours = await query;

    res.status(200).json({
      status: 'success',
      count: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(404).json({
        status: 'fail',
        message: err,
      });
  }
};

export const getTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(404).json({
        status: 'fail',
        message: err,
      });
  }
};

export const createTour = async (req: Request, res: Response) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        status: 'fail',
        message: err,
      });
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        status: 'fail',
        message: err,
      });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({
        status: 'fail',
        message: err,
      });
  }
};
