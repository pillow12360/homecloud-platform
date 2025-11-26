# HomeCloud 플랫폼 API 명세서

본 문서는 HomeCloud 플랫폼에서 제공하는 모든 REST API의 명세입니다.
새로운 기능이 추가될 때마다 이 문서는 지속적으로 업데이트됩니다.

## 1. 공통 응답 형식 (Common Response Format)
모든 API 응답은 아래의 JSON 구조를 따릅니다.

```typescript
interface ApiResponse<T> {
  success: boolean;   // 요청 성공 여부
  message: string;    // 응답 메시지 (성공 시 "Success", 실패 시 에러 메시지)
  data?: T;           // 실제 데이터 (성공 시 포함)
  error?: any;        // 에러 상세 정보 (실패 시 포함)
  timestamp: string;  // 응답 생성 시간 (ISO 8601)
}
```

---

## 2. 시스템 (System)

### 2.1 시스템 상태 확인 (Health Check)
서버 및 데이터베이스 연결 상태를 확인합니다.

- **URL**: `/api/health`
- **Method**: `GET`
- **Auth Required**: No

#### Response (Success 200)
```json
{
  "success": true,
  "message": "System is healthy",
  "data": {
    "status": "ok",
    "services": {
      "database": "connected",
      "server": "running"
    },
    "uptime": 123.45
  },
  "timestamp": "2025-11-26T10:00:00.000Z"
}
```

#### Response (Error 503)
```json
{
  "success": false,
  "message": "System health check failed",
  "data": {
    "status": "error",
    "services": {
      "database": "disconnected",
      "server": "running"
    }
  },
  "timestamp": "2025-11-26T10:00:00.000Z"
}
```

---

## 3. 인증 (Authentication)

### 3.1 회원가입 (Register)
새로운 사용자를 등록합니다.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No

#### Request Body
```json
{
  "email": "user@example.com",  // (필수) 이메일 형식
  "password": "password123",    // (필수) 최소 6자 이상
  "name": "홍길동"              // (필수) 사용자 이름
}
```

#### Response (Success 201)
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": "cm3...",
    "email": "user@example.com",
    "name": "홍길동",
    "emailVerified": null,
    "image": null,
    "createdAt": "2025-11-26T10:00:00.000Z",
    "updatedAt": "2025-11-26T10:00:00.000Z"
  },
  "timestamp": "2025-11-26T10:00:00.000Z"
}
```

#### Response (Error 400 - Validation Failed)
```json
{
  "success": false,
  "message": "입력값이 유효하지 않습니다.",
  "error": {
    "fieldErrors": {
      "email": ["유효한 이메일 주소를 입력해주세요."]
    }
  },
  "timestamp": "2025-11-26T10:00:00.000Z"
}
```

#### Response (Error 400 - Duplicate Email)
```json
{
  "success": false,
  "message": "이미 존재하는 이메일입니다.",
  "timestamp": "2025-11-26T10:00:00.000Z"
}
```
