import { useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SiteAgentComposerProps {
  disabled?: boolean
  onSubmit: (message: string) => Promise<void> | void
}

export function SiteAgentComposer({ disabled = false, onSubmit }: SiteAgentComposerProps) {
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || disabled) {
      return
    }

    setMessage('')
    await onSubmit(trimmed)
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <Input
        aria-label="Ask the site agent"
        disabled={disabled}
        placeholder="Ask about this page"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <Button aria-label="Send message" disabled={disabled} size="icon-sm" type="submit" variant="secondary">
        <SendHorizontal className="size-4" />
      </Button>
    </form>
  )
}
