import Link from "next/link"
import { auth } from "@/auth"
import AuthTest from "@/components/auth-test"
import FileTest from "@/components/file-test"

async function getHealthStatus() {
  try {
    const { prisma } = await import("@/lib/prisma")
    await prisma.$queryRaw`SELECT 1`
    return { status: "ok", database: "connected" }
  } catch (e) {
    return { status: "error", database: "disconnected" }
  }
}

export default async function Home() {
  const health = await getHealthStatus()
  const session = await auth()
  const isHealthy = health.status === "ok"

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HomeCloud 플랫폼</h1>
            <p className="text-gray-600">개인용 PaaS 백엔드 대시보드</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 시스템 상태 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">시스템 상태</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">서버 상태</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  정상 가동 중
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">데이터베이스</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isHealthy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {isHealthy ? "연결됨" : "연결 실패"}
                </span>
              </div>
            </div>
            <div className="mt-6">
               <Link 
                 href="/api/health" 
                 target="_blank"
                 className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
               >
                 헬스 체크 API 결과 보기 (JSON) &rarr;
               </Link>
            </div>
          </div>

          {/* 인증 테스트 카드 */}
          <AuthTest session={session} />
          <FileTest />
          
          {/* 빠른 링크 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">바로가기</h2>
            <ul className="space-y-3">
              <li>
                <div className="block p-3 rounded-lg border border-gray-200 opacity-50 cursor-not-allowed">
                  <div className="font-medium text-gray-900">앱 레지스트리</div>
                  <div className="text-sm text-gray-500">준비 중</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
