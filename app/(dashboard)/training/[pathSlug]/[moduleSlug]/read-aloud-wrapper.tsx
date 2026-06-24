'use client'

import { ReadAloud } from '@/components/training/ReadAloud'
import { startModule, markModuleComplete } from '@/app/actions/training'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function ReadAloudWrapper({
  moduleId,
  blocks,
  readAloudEnabled,
  audioIntroUrl,
  progressStatus,
}: {
  moduleId: string
  blocks: Array<{ type: string; data: Record<string, unknown> }>
  readAloudEnabled: boolean
  audioIntroUrl?: string
  progressStatus: string
}) {
  const router = useRouter()

  const handleComplete = useCallback(async () => {
    if (progressStatus === 'not_started') {
      await startModule(moduleId)
    }
    await markModuleComplete(moduleId)
    router.refresh()
  }, [moduleId, progressStatus, router])

  return (
    <ReadAloud
      moduleId={moduleId}
      blocks={blocks}
      enabled={readAloudEnabled}
      audioIntroUrl={audioIntroUrl}
      onComplete={handleComplete}
    />
  )
}
