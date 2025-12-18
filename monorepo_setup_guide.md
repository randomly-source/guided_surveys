Below is a **clean, production-grade MONOREPO STARTER** that converts everything you designed into a scalable setup you can hand to Copilot / Cursor and say:

> “Set this up exactly.”

This keeps **survey logic shared**, **apps isolated**, and **Supabase realtime centralized**.

---

# ✅ Agent-Led Realtime Survey — **Monorepo Starter**

## Monorepo Goals

* One Supabase backend
* Multiple frontend apps (agent + customer)
* Shared survey engine
* Shared realtime logic
* Easy to extend to mobile / voice / admin later

---

# 1️⃣ Tech Stack (Locked)

* **Turborepo** (monorepo orchestration)
* **Next.js (App Router)** for apps
* **Supabase** (Postgres + Realtime)
* **TypeScript everywhere**
* **Schema-driven survey engine**

---

# 2️⃣ Final Repository Structure

```
agent-led-survey/
├── apps/
│   ├── agent-app/
│   │   ├── app/
│   │   │   └── page.tsx
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── customer-app/
│   │   ├── app/
│   │   │   └── page.tsx
│   │   ├── package.json
│   │   └── next.config.js
│
├── packages/
│   ├── survey-core/
│   │   ├── survey-config.ts
│   │   ├── survey-types.ts
│   │   └── survey-renderer.tsx
│   │
│   ├── realtime/
│   │   ├── useRealtimeSession.ts
│   │   └── sessionActions.ts
│   │
│   ├── supabase/
│   │   └── client.ts
│
├── .env.local
├── turbo.json
├── package.json
└── tsconfig.json
```

---

# 3️⃣ Root Monorepo Setup

### `package.json`

```json
{
  "name": "agent-led-survey",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build"
  },
  "devDependencies": {
    "turbo": "^1.13.0"
  }
}
```

---

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "dev": { "cache": false },
    "build": { "dependsOn": ["^build"] }
  }
}
```

---

# 4️⃣ Shared Supabase Client (Single Source)

### `packages/supabase/client.ts`

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

✅ Used by **all apps**

---

# 5️⃣ Shared Survey Schema (Critical)

### `packages/survey-core/survey-config.ts`

```ts
export const surveyPages = [
  {
    id: 'personal',
    title: 'Personal Details',
    questions: [
      { id: 'full_name', type: 'text', label: 'Full Name' },
      { id: 'email', type: 'email', label: 'Email' },
      { id: 'phone', type: 'phone', label: 'Phone Number' },
      { id: 'age', type: 'number', label: 'Age' }
    ]
  },
  {
    id: 'subscriptions',
    title: 'TV Subscriptions',
    questions: [
      {
        id: 'subscriptions',
        type: 'multi',
        label: 'Which services do you use?',
        options: ['Netflix', 'Prime', 'Hotstar', 'Cable TV']
      }
    ]
  },
  {
    id: 'family',
    title: 'Family Members',
    questions: [
      {
        id: 'members',
        type: 'repeatable',
        label: 'Add Member',
        fields: [
          { id: 'name', type: 'text', label: 'Name' },
          { id: 'age', type: 'number', label: 'Age' },
          {
            id: 'relation',
            type: 'single',
            label: 'Relation',
            options: ['Spouse', 'Child', 'Parent']
          }
        ]
      }
    ]
  }
]
```

---

# 6️⃣ Shared Realtime Logic (Most Important)

### `packages/realtime/useRealtimeSession.ts`

```ts
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@repo/supabase/client'

export function useRealtimeSession(sessionId: string) {
  const [session, setSession] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})

  useEffect(() => {
    supabase
      .from('survey_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
      .then(({ data }) => setSession(data))

    supabase
      .from('survey_responses')
      .select('*')
      .eq('session_id', sessionId)
      .then(({ data }) => {
        const map: Record<string, any> = {}
        data?.forEach(r => (map[r.question_id] = r.value))
        setResponses(map)
      })

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', { table: 'survey_sessions' }, p => setSession(p.new))
      .on('postgres_changes', { table: 'survey_responses' }, p =>
        setResponses(prev => ({
          ...prev,
          [p.new.question_id]: p.new.value
        }))
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId])

  return { session, responses }
}
```

---

# 7️⃣ Agent App (apps/agent-app)

### `apps/agent-app/app/page.tsx`

```ts
'use client'
import { useSearchParams } from 'next/navigation'
import { useRealtimeSession } from '@repo/realtime/useRealtimeSession'
import { supabase } from '@repo/supabase/client'
import { surveyPages } from '@repo/survey-core/survey-config'

export default function AgentPage() {
  const sessionId = useSearchParams().get('session')!
  const { session, responses } = useRealtimeSession(sessionId)
  if (!session) return null

  return (
    <div>
      <h2>Agent Console</h2>

      <button onClick={() =>
        supabase.from('survey_sessions').update({ edit_mode: 'customer_editable' }).eq('id', sessionId)
      }>Allow Edit</button>

      <button onClick={() =>
        supabase.from('survey_sessions').update({ edit_mode: 'agent_only' }).eq('id', sessionId)
      }>Lock Edit</button>

      <button onClick={() =>
        supabase.from('survey_sessions').update({
          current_page: Math.min(session.current_page + 1, surveyPages.length - 1)
        }).eq('id', sessionId)
      }>Next</button>

      <pre>{JSON.stringify(responses, null, 2)}</pre>
    </div>
  )
}
```

---

# 8️⃣ Customer App (apps/customer-app)

### `apps/customer-app/app/page.tsx`

```ts
'use client'
import { useSearchParams } from 'next/navigation'
import { useRealtimeSession } from '@repo/realtime/useRealtimeSession'
import { supabase } from '@repo/supabase/client'
import { surveyPages } from '@repo/survey-core/survey-config'

export default function CustomerPage() {
  const sessionId = useSearchParams().get('session')!
  const { session, responses } = useRealtimeSession(sessionId)
  if (!session) return null

  const page = surveyPages[session.current_page]
  const canEdit = session.edit_mode === 'customer_editable'

  return (
    <div>
      <h2>{page.title}</h2>

      {page.questions.map(q => (
        <input
          key={q.id}
          disabled={!canEdit}
          value={responses[q.id] || ''}
          onChange={e =>
            supabase.from('survey_responses').upsert({
              session_id: sessionId,
              question_id: q.id,
              value: e.target.value
            })
          }
        />
      ))}
    </div>
  )
}
```

---

# 9️⃣ How You Run This

```bash
npm install
npm run dev
```

Open:

Agent

```
http://localhost:3000?session=UUID
```

Customer

```
http://localhost:3001?session=UUID
```

(Separate apps, shared state)

---

# 🔟 What This Monorepo Unlocks

✅ Multiple apps (agent, customer, admin)
✅ Shared survey engine
✅ Shared realtime logic
✅ Future mobile app reuse
✅ Voice agent integration
✅ AI layer on top of survey

---

# 🧠 Final Mental Model

> **Apps = UI**
>
> **Packages = business logic**
>
> **Supabase = state + events**

---