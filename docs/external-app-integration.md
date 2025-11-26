# 외부 애플리케이션 연동 가이드 (External App Integration)

본 문서는 다른 프론트엔드 프로젝트(React, Vue, Mobile App 등)에서 **HomeCloud 플랫폼의 인증 API**를 사용하여 회원가입 및 로그인을 구현하는 방법을 설명합니다.

## 1. 기본 정보
- **Base URL**: `http://localhost:3000` (배포 환경에 따라 변경)
- **인증 방식**: Cookie 기반 세션 (HttpOnly Cookie)
- **CORS 설정**: *주의: 다른 도메인에서 호출 시 서버의 CORS 설정이 필요할 수 있습니다.*

## 2. 회원가입 (Registration)
회원가입은 CSRF 토큰 없이 호출 가능한 일반 REST API입니다.

### 요청
- **Endpoint**: `POST /api/auth/register`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "사용자명"
  }
  ```

### 예제 코드 (Javascript)
```javascript
const register = async (email, password, name) => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  
  if (!response.ok) throw new Error('Registration failed');
  return await response.json();
};
```

---

## 3. 로그인 (Login)
NextAuth.js의 보안 정책상, 로그인을 위해서는 **CSRF 토큰**이 먼저 필요합니다. 따라서 2단계로 진행됩니다.

### 단계 1: CSRF 토큰 발급
- **Endpoint**: `GET /api/auth/csrf`
- **Response**:
  ```json
  { "csrfToken": "abcd..." }
  ```

### 단계 2: 자격 증명 전송
- **Endpoint**: `POST /api/auth/callback/credentials`
- **Content-Type**: `application/x-www-form-urlencoded` (주의: JSON 아님)
- **Body**:
  - `csrfToken`: 단계 1에서 받은 토큰
  - `email`: 사용자 이메일
  - `password`: 사용자 비밀번호

### 예제 코드 (Javascript)
```javascript
const login = async (email, password) => {
  // 1. CSRF 토큰 가져오기
  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  const { csrfToken } = await csrfRes.json();

  // 2. 로그인 요청 (Form Data)
  const formData = new URLSearchParams();
  formData.append('csrfToken', csrfToken);
  formData.append('email', email);
  formData.append('password', password);

  const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    body: formData, // x-www-form-urlencoded 자동 처리
    redirect: 'manual' // 리다이렉트 방지 (선택 사항)
  });

  // 성공 시 서버가 'Set-Cookie' 헤더를 통해 세션 쿠키를 발급합니다.
  // 브라우저 환경에서는 자동으로 쿠키가 저장됩니다.
  if (loginRes.ok || loginRes.status === 302) {
    return true; // 로그인 성공
  }
  return false;
};
```

---

## 4. 세션 확인 (Session Check)
로그인된 상태인지 확인하고 사용자 정보를 가져옵니다. 쿠키가 포함되어야 하므로 `credentials: 'include'` 옵션이 중요합니다.

### 요청
- **Endpoint**: `GET /api/auth/session`
- **Cookie**: `authjs.session-token` (브라우저 자동 전송)

### 예제 코드
```javascript
const getSession = async () => {
  const response = await fetch('http://localhost:3000/api/auth/session', {
    method: 'GET',
    credentials: 'include' // 쿠키 전송 필수
  });

  const session = await response.json();
  
  if (Object.keys(session).length === 0) {
    return null; // 비로그인 상태
  }
  return session; // { user: { name, email, ... }, expires: ... }
};
```

## 5. 로그아웃 (Logout)
로그아웃 역시 CSRF 토큰이 필요할 수 있습니다. (NextAuth 설정에 따라 다름, 보통 POST 권장)

- **Endpoint**: `POST /api/auth/signout`
- **Body**: `{ "csrfToken": "..." }` (form-urlencoded)
