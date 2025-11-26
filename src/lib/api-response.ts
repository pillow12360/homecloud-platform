import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: any
  timestamp: string
}

export function successResponse<T>(data: T, message: string = "Success", status: number = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

export function errorResponse(message: string = "Error", error?: any, status: number = 500) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}
