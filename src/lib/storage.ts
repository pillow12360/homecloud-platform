import { S3Client } from "@aws-sdk/client-s3"

const globalForS3 = globalThis as unknown as { s3: S3Client }

export const s3Client =
  globalForS3.s3 ||
  new S3Client({
    region: "us-east-1", // MinIO는 리전이 크게 중요하지 않으나 필수값
    endpoint: process.env.MINIO_ENDPOINT,
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY || "",
      secretAccessKey: process.env.MINIO_SECRET_KEY || "",
    },
    forcePathStyle: true, // MinIO 필수 설정 (path-style URL 사용)
  })

if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3Client

export const BUCKET_NAME = process.env.MINIO_BUCKET || "homecloud"
