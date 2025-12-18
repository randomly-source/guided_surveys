Below is a **single, complete Copilot / Cursor prompt** you can paste as-is.
It contains **the full problem statement, architecture, schema, and starter code expectations**, so the coding agent can set everything up end-to-end.

You only need to:

* Create a Supabase project
* Add credentials to `.env.local`

---

# ✅ COPY-PASTE THIS ENTIRE PROMPT INTO COPILOT / CURSOR

---

## 🔵 Problem Statement

Build a **Next.js (App Router) application** that supports an **agent-led, real-time, multi-page survey**, where:

* An **agent** shares a survey link with a **customer** during a call
* Both open the **same session** on different devices/browsers
* The **agent controls navigation and edit permissions**
* The **customer fills the form**
* All changes are synced **live using Supabase Realtime**
* No page refresh is required
* The same backend state is shared across devices

---

## 🔑 Core Requirements

### Roles

* **Agent**

  * Can move between survey pages
  * Can lock/unlock customer editing
  * Sees live responses in structured JSON
* **Customer**

  * Can edit fields only when unlocked
  * Cannot navigate pages
  * Sees agent-driven page changes instantly

### URLs

* Agent: `/agent?session=<uuid>`
* Customer: `/survey?session=<uuid>`

---

## 🧱 Tech Stack

* Next.js 14+ (App Router)
* React (client components)
* Supabase

  * Postgres
  * Realtime (`postgres_changes`)
* No custom backend servers
* All persistence via Supabase

---

## 🗄️ Database Schema (Supabase)

```sql
create table survey_sessions (
  id uuid primary key,
  current_page int default 0,
  edit_mode text default 'customer_editable'
);

create table survey_responses (
  session_id uuid,
  question_id text,
  value jsonb,
  primary key (session_id, question_id)
);
```

Enable **Realtime replication** for both tables.

---

## 🧠 Survey Schema (Single Source of Truth)

Create `app/survey-config.ts`

```ts
export const surveyPages = [
  {
    id: 'personal_details',
    title: 'Personal Details',
    questions: [
      { id: 'full_name', type: 'text', label: 'Full Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address' },
      { id: 'phone', type: 'phone', label: 'Phone Number' },
      { id: 'age', type: 'number', label: 'Age' }
    ]
  },

  {
    id: 'address',
    title: 'Address',
    questions: [
      {
        id: 'address',
        type: 'group',
        label: 'Residential Address',
        fields: [
          { id: 'line1', type: 'text', label: 'Address Line 1' },
          { id: 'city', type: 'text', label: 'City' },
          { id: 'state', type: 'text', label: 'State' },
          { id: 'pincode', type: 'number', label: 'Pincode' }
        ]
      }
    ]
  },

  {
    id: 'tv_usage',
    title: 'TV Usage',
    questions: [
      { id: 'watch_tv', type: 'yesno', label: 'Do you watch TV?' },
      {
        id: 'hours_per_day',
        type: 'number',
        label: 'Hours per day',
        showIf: { watch_tv: 'yes' }
      }
    ]
  },

  {
    id: 'subscriptions',
    title: 'Subscriptions',
    questions: [
      {
        id: 'subscriptions',
        type: 'multi',
        label: 'Which subscriptions do you have?',
        options: [
          'Cable TV',
          'Netflix',
          'Amazon Prime',
          'Disney+ Hotstar',
          'YouTube Premium'
        ]
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
        label: 'Add Family Member',
        fields: [
          { id: 'name', type: 'text', label: 'Name' },
          { id: 'age', type: 'number', label: 'Age' },
          {
            id: 'relation',
            type: 'single',
            label: 'Relation',
            options: ['Spouse', 'Child', 'Parent', 'Other']
          }
        ]
      }
    ]
  },

  {
    id: 'confirmation',
    title: 'Confirmation',
    questions: [
      { id: 'confirm', type: 'yesno', label: 'Are all details correct?' }
    ]
  }
]
```

---

## 🧩 How Answers Must Be Stored

All answers go into **one table** using `jsonb`:

| Question Type | Stored Value                       |
| ------------- | ---------------------------------- |
| text / email  | `"John Doe"`                       |
| number        | `30`                               |
| yesno         | `"yes"`                            |
| multi         | `["Netflix", "Prime"]`             |
| group         | `{ line1, city, pincode }`         |
| repeatable    | `[ { name, age }, { name, age } ]` |

---

## 🔄 Realtime Requirements

Implement a reusable hook:

```ts
useRealtimeSession(sessionId)
```

It must:

* Load initial session state
* Load existing responses
* Subscribe to Supabase Realtime
* Sync:

  * `current_page`
  * `edit_mode`
  * `survey_responses`

No polling. No refresh.

---

## 🧑‍💻 Pages to Implement

### `/survey/page.tsx` (Customer)

* Renders current page from schema
* Uses a generic renderer:

  * text, email, phone, number
  * yes/no radio
  * single select
  * multi select
  * grouped fields
  * repeatable sections
* Disables inputs when agent locks editing
* Reacts instantly to agent navigation

### `/agent/page.tsx` (Agent)

* Buttons:

  * Next page
  * Lock edit
  * Unlock edit
* Displays live responses as formatted JSON
* Same session as customer

---

## 🔐 Supabase Client

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## 🧪 Expected Behavior to Validate

* Open agent on laptop, customer on phone
* Customer types → agent sees instantly
* Agent locks → customer inputs disable instantly
* Agent navigates → customer page changes instantly
* Refreshing does not lose state

---

## 🎯 Non-Goals (Do NOT implement yet)

* Auth / login
* RLS policies
* Styling polish
* Validation engine
* Submission workflow

---

## ✅ Deliverables

* Fully working Next.js app
* Schema-driven survey renderer
* Supabase Realtime integration
* Clear separation of agent vs customer
* Minimal but clean UI

---

### End of prompt.

---