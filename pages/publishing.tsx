import { useEffect } from "react"
import { useRouter } from "next/router"

export default function Publishing() {
  const router = useRouter()
  useEffect(() => { router.replace("/newsdesk") }, [])
  return null
}
