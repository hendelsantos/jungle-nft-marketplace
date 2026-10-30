import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorState({ title = 'Algo saiu da trilha', message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div className="surface grid min-h-64 place-items-center p-8 text-center" role="alert">
      <div className="max-w-md">
        <AlertTriangle className="mx-auto mb-4 size-9 text-amber-300" />
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 text-muted">{message}</p>
        {onRetry ? <Button className="mt-5" onClick={onRetry}>Tentar novamente</Button> : null}
      </div>
    </div>
  )
}
