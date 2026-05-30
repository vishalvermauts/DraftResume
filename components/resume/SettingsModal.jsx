'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useResumeStore } from '@/lib/resumeStore'
import { KeyRound, ShieldCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react'

const ANTHROPIC_MODELS = [
  { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (recommended)' },
  { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
  { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (cheaper)' },
]
const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (recommended)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
]

export default function SettingsModal({ open, onOpenChange }) {
  const { provider, apiKey, model, setProvider, setApiKey, setModel } = useResumeStore()
  const [localProvider, setLocalProvider] = useState(provider)
  const [localKey, setLocalKey] = useState(apiKey)
  const [localModel, setLocalModel] = useState(model)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null) // { ok, message }

  useEffect(() => {
    setLocalProvider(provider)
    setLocalKey(apiKey)
    setLocalModel(model)
    setTestResult(null)
  }, [open, provider, apiKey, model])

  const modelOptions = localProvider === 'anthropic' ? ANTHROPIC_MODELS : GEMINI_MODELS
  const effectiveModel = localModel || modelOptions[0].id

  const onProviderChange = (p) => {
    setLocalProvider(p)
    setLocalModel('') // reset to default
    setTestResult(null)
  }

  const testConnection = async () => {
    setTesting(true); setTestResult(null)
    try {
      const resp = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': localKey.trim(),
          'x-provider': localProvider,
          'x-model': effectiveModel,
        },
        body: JSON.stringify({
          system: 'Reply with exactly: {"ok":true}',
          user: 'Reply with exactly {"ok":true} and nothing else.',
          jsonMode: true,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setTestResult({ ok: false, message: data?.error || `HTTP ${resp.status}` })
      } else {
        setTestResult({ ok: true, message: `Connected. Model "${effectiveModel}" responded.` })
      }
    } catch (e) {
      setTestResult({ ok: false, message: e.message || 'Network error' })
    } finally {
      setTesting(false)
    }
  }

  const save = () => {
    setProvider(localProvider)
    setApiKey(localKey.trim())
    setModel(localModel)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-indigo-600"/> AI Provider Settings</DialogTitle>
          <DialogDescription>
            Bring Your Own Key. Your API key is stored only in your browser&apos;s localStorage and forwarded through a stateless proxy. It is never logged or persisted on the server.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={localProvider} onValueChange={onProviderChange}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="google">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={effectiveModel} onValueChange={setLocalModel}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                {modelOptions.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder={localProvider === 'anthropic' ? 'sk-ant-...' : 'AIza...'}
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> Stored locally. Never logged on the server.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={testConnection} disabled={!localKey || testing}>
              {testing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Testing...</> : 'Test Connection'}
            </Button>
            {testResult && (
              testResult.ok ? (
                <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> {testResult.message}</span>
              ) : (
                <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4"/> {testResult.message}</span>
              )
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {localProvider === 'anthropic' ? (
              <>Get a key at <a className="underline" target="_blank" rel="noreferrer" href="https://console.anthropic.com/settings/keys">console.anthropic.com</a>. New accounts need credits at <a className="underline" target="_blank" rel="noreferrer" href="https://console.anthropic.com/settings/billing">Billing</a>.</>
            ) : (
              <>Get a key at <a className="underline" target="_blank" rel="noreferrer" href="https://aistudio.google.com/apikey">aistudio.google.com</a> (free tier available).</>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
