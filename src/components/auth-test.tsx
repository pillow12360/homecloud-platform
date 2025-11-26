"use client"

import { signIn, signOut } from "next-auth/react"
import type { Session } from "next-auth"
import Link from "next/link"
import { useState } from "react"

export default function AuthTest({ session }: { session: Session | null }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message || "회원가입 실패")
      
      setMessage({ type: "success", text: "회원가입 성공! 이제 로그인해주세요." })
      setFormData({ name: "", email: "", password: "" })
      setIsRegistering(false)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  if (session?.user) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">사용자 세션 정보</h2>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-green-800 font-medium">로그인 상태입니다</p>
            <p className="text-sm text-green-700 mt-1">이메일: {session.user.email}</p>
            <p className="text-sm text-green-700">이름: {session.user.name}</p>
            <p className="text-xs text-green-600 mt-2 font-mono">ID: {session.user.id}</p>
          </div>
          
          <button
            onClick={() => signOut()}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            로그아웃
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">인증 테스트</h2>
      
      {message && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${
          message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {isRegistering ? (
        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            로그인 또는 회원가입을 테스트해보세요.
          </p>
          
          <button
            onClick={() => signIn()}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            로그인 (NextAuth 기본 UI)
          </button>
          
          <button
            onClick={() => setIsRegistering(true)}
            className="w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            회원가입 테스트
          </button>

          <div className="text-center text-xs text-gray-500 mt-2">
            또는{" "}
            <Link href="/api/auth/signin" className="text-blue-600 hover:underline">
              직접 이동
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
