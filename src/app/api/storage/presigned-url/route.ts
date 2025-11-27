import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client, BUCKET_NAME } from "@/lib/storage"
import { prisma } from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/api-response"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", null, 401)
    }

    const { filename, contentType, size } = await req.json()

    if (!filename || !contentType || !size) {
      return errorResponse("Missing required fields", null, 400)
    }

    // 파일 크기 제한 (예: 100MB)
    const MAX_SIZE = 100 * 1024 * 1024
    if (size > MAX_SIZE) {
      return errorResponse("File size too large (Max 100MB)", null, 400)
    }

    const key = `users/${session.user.id}/${randomUUID()}-${filename}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // DB에 파일 정보 저장 (업로드 예정 상태)
    const file = await prisma.file.create({
      data: {
        filename,
        key,
        mimetype: contentType,
        size,
        bucket: BUCKET_NAME,
        userId: session.user.id,
      },
    })

    return successResponse({
      url: signedUrl,
      key,
      fileId: file.id,
    }, "Presigned URL generated successfully")

  } catch (error) {
    console.error("Presigned URL Error:", error)
    return errorResponse("Failed to generate presigned URL", error, 500)
  }
}
