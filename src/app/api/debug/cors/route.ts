"use client"

import { NextResponse } from "next/server"
import { s3Client, BUCKET_NAME } from "@/lib/storage"
import { GetBucketCorsCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3"

export async function GET() {
  try {
    const command = new GetBucketCorsCommand({ Bucket: BUCKET_NAME })
    const response = await s3Client.send(command)
    return NextResponse.json({ status: "success", cors: response.CORSRules })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message, code: error.name })
  }
}

export async function POST() {
  try {
    const corsRules = [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["PUT", "POST", "DELETE", "GET", "HEAD"],
        AllowedOrigins: ["http://localhost:3000", "https://homecloud.pillow12360.world"], // Add other origins if needed
        ExposeHeaders: ["ETag"],
        MaxAgeSeconds: 3000,
      },
    ]

    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: { CORSRules: corsRules },
    })

    await s3Client.send(command)
    return NextResponse.json({ status: "success", message: "CORS configured successfully" })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message })
  }
}
