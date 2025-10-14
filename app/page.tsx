import { LoginForm } from "@/components/login-form"
import { Building2 } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background rounded-lg  border-2">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-lg bg-green-400 flex items-center justify-center border border-primary/20 text-white">
            <Building2 className="h-6 w-6 text-primary text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance ">Nigerian Social Insurance Trust Fund</h1>
          <p className="text-muted-foreground text-balance">
            Secure access to compliance, claims, and legal management
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
