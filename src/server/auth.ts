import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const getServerAuthSession = () => getServerSession(authOptions)