"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

export default function FileTest() {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    if (!session) {
      setMessage({ type: "error", text: "로그인이 필요합니다." })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      // 1. Presigned URL 요청
      const presignedRes = await fetch("/api/storage/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      })

      const presignedData = await presignedRes.json()
      if (!presignedRes.ok) throw new Error(presignedData.message || "Presigned URL 발급 실패")

      const { url } = presignedData.data

      // 2. MinIO(S3)로 파일 업로드
      const uploadRes = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadRes.ok) throw new Error("파일 업로드 실패")

      setMessage({ type: "success", text: "파일 업로드 성공!" })
      setFile(null)
      // 파일 입력 초기화
      const fileInput = document.getElementById("file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""

    } catch (error: any) {
      console.error(error)
      setMessage({ type: "error", text: error.message })
    } finally {
      setUploading(false)
    }
  }

  if (!session) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">파일 스토리지 테스트</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">파일 선택</label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "업로드 중..." : "업로드 시작"}
        </button>
      </div>
    </div>
  )
}
