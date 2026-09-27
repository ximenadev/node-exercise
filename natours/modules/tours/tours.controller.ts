import type { Request, Response } from 'express';

export const getAllTours = (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', data: { tours: [] } });
};

export const getTour = (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', data: { id: req.params.id } });
};

export const createTour = (req: Request, res: Response) => {
  res.status(201).json({ status: 'success', data: req.body });
};

export const updateTour = (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: 'success', data: { id: req.params.id, ...req.body } });
};

export const deleteTour = (req: Request, res: Response) => {
  res.status(204).json({ status: 'success', data: null });
};
