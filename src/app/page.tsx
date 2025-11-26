import Link from "next/link"

async function getHealthStatus() {
  try {
/**
 * @description 시스템 상태 조회 함수 (Server Component용)
 *
 * 서버 컴포넌트에서 내부 API 라우트(/api/health)를 호출하려면 절대 경로(URL)가 필요하므로,
 * 빌드 타임이나 배포 환경에 따라 호출이 실패할 수 있습니다.
 *
 * 따라서, API를 호출하는 대신 Prisma 클라이언트를 직접 사용하여
 * 데이터베이스 연결 상태를 확인하는 방식을 사용합니다.
 *
 * @returns {Promise<{status: string, database: string}>} 시스템 상태 객체
 */
    const { prisma } = await import("@/lib/prisma")
    await prisma.$queryRaw`SELECT 1`
    return { status: "ok", database: "connected" }
  } catch (e) {
    return { status: "error", database: "disconnected" }
  }
}

export default async function Home() {
  const health = await getHealthStatus()
  const isHealthy = health.status === "ok"

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HomeCloud 플랫폼</h1>
          <p className="text-gray-600">개인용 PaaS 백엔드 대시보드</p>
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

          {/* 빠른 링크 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">바로가기</h2>
            <ul className="space-y-3">
              <li>
                <div className="block p-3 rounded-lg border border-gray-200 opacity-50 cursor-not-allowed">
                  <div className="font-medium text-gray-900">로그인 페이지</div>
                  <div className="text-sm text-gray-500">구현 대기 중</div>
                </div>
              </li>
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
