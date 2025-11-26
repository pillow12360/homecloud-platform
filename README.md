# HomeCloud Platform Backend

HomeCloud Platform은 개인 홈서버 위에서 구동되는 다양한 서비스(앱)들의 공통 기반이 되는 개인용 PaaS(Platform as a Service) 프로젝트입니다.

매번 새로운 프로젝트를 시작할 때마다 반복되는 인증, 파일 저장소, DB 설정을 제거하고, 이 백엔드를 통해 공통 기능을 제공받아 비즈니스 로직에만 집중할 수 있도록 돕습니다.

## 프로젝트 목표

1.  개발 효율성 극대화: 회원가입, 로그인, 파일 업로드 등 반복되는 인프라 구현 비용 제거.
2.  중앙 집중 관리: 모든 앱의 사용자(User)와 파일(File)을 한곳에서 통합 관리.
3.  확장성 (Scalability): 새로운 앱(Blog, 가계부 등)을 쉽게 추가하고, API Key를 통해 플랫폼과 연동.

## 아키텍처

이 프로젝트는 플랫폼(Platform)과 개별 앱(App)의 경계를 명확히 구분합니다.

### 플랫폼 영역 (이 저장소)
*   통합 계정 관리 (Auth): NextAuth.js 기반의 중앙 인증 시스템.
*   파일 저장소 (Storage): MinIO(S3) 기반의 파일 관리 및 Presigned URL 발급.
*   앱 관리 (App Registry): 플랫폼을 사용하는 앱 등록 및 API Key 발급.
*   공통 API: 헬스 체크, 사용자 프로필 조회 등.

### 개별 앱 영역
*   예: `homecloud-blog`, `homecloud-account-book`
*   각 앱은 플랫폼의 API를 호출하여 로그인 처리 및 파일 업로드 기능을 수행합니다.

## 기술 스택

*   Framework: Next.js 15 (App Router)
*   Language: TypeScript
*   Database: PostgreSQL (Docker)
*   ORM: Prisma
*   Auth: NextAuth.js
*   Storage: MinIO (Self-hosted S3)
*   Infra: Docker, Cloudflare Tunnel

## 폴더 구조

직관적인 유지보수를 위해 기능(Feature) 단위로 코드를 응집시켰습니다.

```
src/
├── app/             # Next.js App Router (API 엔드포인트)
├── modules/         # 비즈니스 로직 (핵심 도메인)
│   ├── auth/        # 인증 (Auth.js)
│   ├── users/       # 사용자 관리
│   ├── storage/     # 파일 업로드 (MinIO)
│   ├── apps/        # 앱 등록 및 관리
│   └── common/      # 공통 유틸리티
├── components/      # 공통 UI 컴포넌트
└── lib/             # 서드파티 라이브러리 설정 (Prisma, S3 등)
```