import { Request, Response } from "express";

class FileController {
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          path: req.file.path,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error?.message,
      });
    }
  }
}

export const fileController = new FileController();
