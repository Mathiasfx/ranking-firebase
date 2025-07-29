"use client"

import { useEffect, useState } from "react"
import { validateFirebaseConnection } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export function FirebaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    error?: string
  } | null>(null)

  useEffect(() => {
    const checkConnection = () => {
      const result = validateFirebaseConnection()
      setConnectionStatus(result)
    }

    checkConnection()
  }, [])

  if (!connectionStatus) return null

  return (
    <Alert className={connectionStatus.success ? "border-green-500" : "border-red-500"}>
      <div className="flex items-center gap-2">
        {connectionStatus.success ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <AlertDescription>
          {connectionStatus.success
            ? "✅ Conexión a Firebase establecida correctamente"
            : `❌ Error de conexión: ${connectionStatus.error}`}
        </AlertDescription>
      </div>
    </Alert>
  )
}
