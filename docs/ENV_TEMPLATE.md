# 환경 변수 템플릿

이 내용을 루트 디렉토리의 `.env` 파일에 복사하세요.

```bash
# 데이터베이스 (Database)
# Tailscale IP 또는 Localhost를 통해 PostgreSQL에 연결
# 형식: postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
DATABASE_URL="postgresql://pillow12360:PASSWORD@100.118.23.107:5432/appdb?schema=public"

# NextAuth
# `openssl rand -base64 32` 명령어로 비밀 키 생성
NEXTAUTH_SECRET="changeme"
NEXTAUTH_URL="http://localhost:3000"

# MinIO (S3 호환)
MINIO_ENDPOINT="https://minio.pillow12360.world"
MINIO_ACCESS_KEY="pillow12360"
MINIO_SECRET_KEY="changeme"
MINIO_BUCKET_NAME="homecloud-bucket"
MINIO_REGION="us-east-1"
```
