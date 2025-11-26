import { successResponse, errorResponse } from "@/lib/api-response"
import { RegisterSchema } from "@/schemas/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedFields = RegisterSchema.safeParse(body)

    if (!validatedFields.success) {
      return errorResponse("입력값이 유효하지 않습니다.", validatedFields.error.flatten(), 400)
    }

    const { email, password, name } = validatedFields.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse("이미 존재하는 이메일입니다.", null, 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = user

    return successResponse(userWithoutPassword, "회원가입이 완료되었습니다.", 201)
  } catch (error) {
    console.error("Registration Error:", error)
    return errorResponse("회원가입 중 오류가 발생했습니다.", error, 500)
  }
}
