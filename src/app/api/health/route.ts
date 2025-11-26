import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api-response"

/**
 * @description 시스템 상태 확인 (Health Check) API
 *
 * 데이터베이스 연결 상태와 서버 가동 시간을 확인하여 반환합니다.
 * 대시보드나 외부 모니터링 도구(Uptime Kuma 등)에서 서버 생존 여부를 판단하는 데 사용됩니다.
 *
 * @returns {Promise<NextResponse>} JSON 응답
 * - 200 OK: 모든 서비스 정상
 * - 503 Service Unavailable: DB 연결 실패 등 문제 발생
 */
export async function GET() {
  try {
    // Check Database Connection
    await prisma.$queryRaw`SELECT 1`
    
    const healthData = {
      status: "ok",
      services: {
        database: "connected",
        server: "running"
      },
      uptime: process.uptime()
    }

    return successResponse(healthData, "System is healthy")
  } catch (error) {
    console.error("Health Check Failed:", error)
    
    const healthData = {
      status: "error",
      services: {
        database: "disconnected",
        server: "running"
      }
    }

    return errorResponse("System health check failed", healthData, 503)
  }
}
