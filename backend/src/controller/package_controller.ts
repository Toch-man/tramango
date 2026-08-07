import { Request, Response } from "express";
import { Package } from "../models/package_model";

export const getPackages = async (req: Request, res: Response) => {
  try {
    const packages = await Package.find();

    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch packages",
    });
  }
};

export const bookPackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const packageItem = await Package.findOneAndUpdate(
      {
        _id: id,
        availableSlots: { $gt: 0 },
      },
      {
        $inc: { availableSlots: -1 },
      },
      {
        new: true,
      },
    );

    if (!packageItem) {
      return res.status(404).json({
        success: false,
        message: "Package not found or no slots available",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Package booked successfully",
      data: packageItem,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to book package",
    });
  }
};
