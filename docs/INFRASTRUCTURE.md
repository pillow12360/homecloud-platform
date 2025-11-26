# 온프레미스 클라우드 환경 문서

## 1. 서버 인프라 개요

### 1.1 구성 요소
- **Host OS**: Windows 11 (24H2)
- **Guest OS**: WSL2 Ubuntu
- **컨테이너 런타임**: Docker
- **DB 서버**: PostgreSQL (Docker)
- **Object Storage 서버**: MinIO (Docker)
- **Zero-trust VPN**: Tailscale
- **HTTPS Reverse Tunnel (Public)**: Cloudflare Tunnel
- **도메인**: [pillow12360.world](http://pillow12360.world)

### 1.2 연결 방식 요약

**외부 접근 구분**
1.  **개발용 개인 접근 (VPN)**
    *   **경로**: 외부 PC → Tailscale → 집 Windows → WSL/Docker
    *   **용도**: PostgreSQL 접속, 내부 API 테스트, 내부 MinIO 접근
2.  **공개 서비스용 접근 (HTTPS)**
    *   **경로**: 인터넷 → Cloudflare Tunnel → 집 WSL → Docker MinIO
    *   **용도**: Next.js 등 앱에서 MinIO 업로드/다운로드

## 2. 내부 네트워크 구조

```
Windows 11
└─ WSL2 Ubuntu
   └─ Docker
      ├─ PostgreSQL
      └─ MinIO
   └─ Tailscale (100.x.x.x IP 할당)
   └─ Cloudflare Tunnel (HTTPS)
```

## 3. 주요 명령어 모음

### 3.1 WSL2
- **Ubuntu 실행**: `wsl -d Ubuntu`
- **시스템 업데이트**: `sudo apt update && sudo apt upgrade -y`
- **버전 확인**: `wsl -l -v`
- **종료**: `wsl --shutdown`

### 3.2 Docker
- **컨테이너 목록 확인**: `sudo docker ps`
- **전체 실행**: `sudo docker compose up -d`
- **전체 중지**: `sudo docker compose down`
- **컨테이너 재시작**: `sudo docker restart <컨테이너명>`
- **로그 확인**:
    - `sudo docker logs homecloud-postgres`
    - `sudo docker logs homecloud-minio`

### 3.3 PostgreSQL
- **접속 (로컬)**: `psql -h localhost -U pillow12360 -d appdb`
- **접속 (Tailscale)**: `psql -h 100.118.23.107 -U pillow12360 -d appdb`

### 3.4 MinIO
- **로그 확인**: `sudo docker logs homecloud-minio`
- **웹 콘솔**: [https://minio.pillow12360.world/](https://minio.pillow12360.world/)
- **내부 URL**: `http://100.118.23.107:9000`

### 3.5 Cloudflare Tunnel
- **터널 실행**: `cloudflared tunnel run homecloud`
- **서비스 설치**: `sudo cloudflared service install`
- **로그 확인**: `sudo journalctl -u cloudflared -f`
- **서비스 재시작**: `sudo systemctl restart cloudflared`

### 3.6 Tailscale
- **상태 확인**: `tailscale status`
- **IP 확인**: `tailscale ip`
- **Ping 테스트**: `tailscale ping 100.118.23.107`
- **SSH 접속**: `ssh 100.118.23.107`

## 4. 설정 상세 정보

### 4.1 Docker Compose (현재 구성)
```yaml
version: "3"
services:
  postgres:
    image: postgres:15
    container_name: homecloud-postgres
    environment:
      POSTGRES_USER: pillow12360
      POSTGRES_PASSWORD: <비밀번호>
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  minio:
    image: minio/minio
    container_name: homecloud-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: pillow12360
      MINIO_ROOT_PASSWORD: <비밀번호>
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
volumes:
  postgres_data:
  minio_data:
```

### 4.2 접속 정보
- **PostgreSQL**:
    - Host: `localhost` (내부) / `100.118.23.107` (Tailscale)
    - Port: `5432`
    - User: `pillow12360`
    - DB: `appdb`
- **MinIO**:
    - Console: `https://minio.pillow12360.world/`
    - API: `https://minio.pillow12360.world/`
