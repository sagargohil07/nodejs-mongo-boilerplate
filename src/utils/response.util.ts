import { Response } from 'express';

interface ApiResponse {
  status: number;
  message: string;
  data?: any;
  error?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ResponseUtil {
  // 200 - Success
  static success(
    res: Response,
    message: string = 'Success',
    data: any = null,
    pagination?: ApiResponse['pagination']
  ): Response {
    const response: ApiResponse = {
      status: 200,
      message,
      data
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(200).json(response);
  }

  // 201 - Created
  static created(
    res: Response,
    message: string = 'Resource created successfully',
    data: any = null
  ): Response {
    const response: ApiResponse = {
      status: 201,
      message,
      data
    };

    return res.status(201).json(response);
  }

  // 400 - Bad Request
  static badRequest(
    res: Response,
    message: string = 'Bad request',
    error: any = null
  ): Response {
    const response: ApiResponse = {
      status: 400,
      message,
      error
    };

    return res.status(400).json(response);
  }

  // 401 - Unauthorized
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access',
    error: any = null
  ): Response {
    const response: ApiResponse = {
      status: 401,
      message,
      error
    };

    return res.status(401).json(response);
  }

  // 404 - Not Found
  static notFound(
    res: Response,
    message: string = 'Resource not found',
    error: any = null
  ): Response {
    const response: ApiResponse = {
      status: 404,
      message,
      error
    };

    return res.status(404).json(response);
  }

  // 500 - Internal Server Error
  static internalServerError(
    res: Response,
    message: string = 'Internal server error',
    error: any = null
  ): Response {
    const response: ApiResponse = {
      status: 500,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    };

    return res.status(500).json(response);
  }
}