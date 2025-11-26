# 인증 시스템 구현 상세 (Authentication Implementation)

## 1. 개요
HomeCloud 플랫폼은 **NextAuth.js v5 (Beta)** 를 사용하여 보안성이 높고 확장 가능한 인증 시스템을 구축했습니다.
이 시스템은 이메일/비밀번호 기반의 로그인(Credentials Provider)을 지원하며, 데이터베이스는 PostgreSQL(Prisma ORM)을 사용합니다.

## 2. 아키텍처 및 기술 스택
- **Framework**: NextAuth.js v5
- **Database**: PostgreSQL
- **ORM**: Prisma (w/ `@auth/prisma-adapter`)
- **Hashing**: bcryptjs (비밀번호 단방향 암호화)
- **Validation**: Zod (입력 데이터 검증)
- **Session**: JWT (Stateless 세션 관리)

## 3. 파일 구조 및 역할

| 파일 경로 | 설명 |
|---|---|
| `src/auth.ts` | **인증 코어**: `NextAuth` 초기화, `Credentials` 공급자 설정, 로그인 로직(`authorize`) 구현. |
| `src/auth.config.ts` | **인증 설정**: Edge Runtime 호환성을 위한 설정 분리. 미들웨어에서 사용되는 라우트 보호 로직(`authorized`) 포함. |
| `src/middleware.ts` | **보안 미들웨어**: 모든 요청을 가로채어 비로그인 사용자의 보호된 라우트 접근을 차단. |
| `src/schemas/auth.ts` | **유효성 검사**: 로그인 및 회원가입 폼 데이터 검증을 위한 Zod 스키마 정의. |
| `src/app/api/auth/register/route.ts` | **회원가입 API**: 사용자 생성을 위한 커스텀 API. 이메일 중복 확인 및 비밀번호 해싱 수행. |

## 4. 주요 기능 구현 상세

### 4.1 데이터베이스 스키마 (`User` 모델)
`prisma/schema.prisma`에 비밀번호 필드를 추가하여 Credentials 로그인을 지원합니다.
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?   // bcrypt로 해싱된 비밀번호
  // ...
}
```

### 4.2 회원가입 프로세스
1. **API 호출**: 클라이언트가 `/api/auth/register`로 POST 요청 (이메일, 비밀번호, 이름)
2. **검증**: `RegisterSchema`를 통해 입력값 형식 확인
3. **중복 체크**: `prisma.user.findUnique`로 이메일 중복 여부 확인
4. **암호화**: `bcrypt.hash(password, 10)`을 사용하여 비밀번호 해싱
5. **저장**: `prisma.user.create`로 사용자 레코드 생성

### 4.3 로그인 프로세스 (Credentials)
1. **로그인 시도**: NextAuth의 `signIn('credentials', ...)` 함수 호출
2. **검증 로직 (`src/auth.ts`)**:
   - `authorize` 콜백 실행
   - 이메일로 사용자 조회
   - `bcrypt.compare`로 비밀번호 일치 여부 확인
3. **세션 생성**: 검증 성공 시 JWT 토큰 발급 및 세션 쿠키 설정

### 4.4 라우트 보호 (Middleware)
`src/middleware.ts`와 `src/auth.config.ts`의 `authorized` 콜백을 통해 동작합니다.
- `/dashboard` 등 보호된 경로 접근 시 로그인 여부 확인
- 비로그인 시 로그인 페이지로 리다이렉트
- 로그인 상태에서 `/auth/*` 접근 시 대시보드로 리다이렉트

## 5. 테스트 방법
현재 루트 페이지(`http://localhost:3000`)에 통합 테스트 UI가 구현되어 있습니다.
- **회원가입 테스트**: 이름, 이메일, 비밀번호 입력 후 가입 시도
- **로그인 테스트**: 가입한 계정으로 로그인 시도
- **세션 확인**: 로그인 후 사용자 정보(이름, 이메일) 표시 및 로그아웃 기능 확인
