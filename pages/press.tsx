import { useEffect } from "react"
import { useRouter } from "next/router"

export default function PressRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/newsdesk") }, [router])
  return null
}
