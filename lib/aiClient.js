'use client'

const SCHEMA_TS = `interface Resume {
  personalDetails: { fullName: string; email: string; phone: string; linkedin: string; github?: string; portfolio?: string; };
  professionalSummary: string;
  employmentHistory: Array<{ jobTitle: string; company: string; location: string; startDate: string; endDate: string; bulletPoints: string[]; }>;
  projects: Array<{ name: string; techStack: string; description: string[]; }>;
  education: Array<{ degree: string; major: string; school: string; endDate: string; relevantCoursework?: string; }>;
  skills: { [category: string]: string[]; };
  certifications: Array<{ name: string; date: string; }>;
}`

const BASE_SYSTEM = `You are a resume parsing & writing assistant. You always return STRICT JSON matching the provided TypeScript interface. No prose, no markdown, no code fences. Only a single JSON object.\n\nSCHEMA:\n${SCHEMA_TS}\n\nRules:\n- Dates use MM/YYYY (e.g. 03/2022) or 'Present' for ongoing.\n- Use empty string '' for missing string fields, empty array [] for missing lists.\n- skills is an object grouping into categories (e.g. Languages, Frameworks, Tools).\n- Never invent information. If a field is unknown, leave it empty.`

function extractJson(text) {
  if (!text) throw new Error('Empty AI response')
  let t = text.trim()
  // Strip code fences if present
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json|JSON)?\s*/i, '').replace(/```\s*$/i, '').trim()
  }
  // Try direct parse first
  try { return JSON.parse(t) } catch (_) { /* fallthrough */ }

  // Find first balanced top-level JSON object
  const findBalanced = (s) => {
    let depth = 0, start = -1, inStr = false, esc = false
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]
      if (inStr) {
        if (esc) { esc = false; continue }
        if (ch === '\\') { esc = true; continue }
        if (ch === '"') inStr = false
        continue
      }
      if (ch === '"') { inStr = true; continue }
      if (ch === '{') {
        if (depth === 0) start = i
        depth++
      } else if (ch === '}') {
        depth--
        if (depth === 0 && start !== -1) return s.slice(start, i + 1)
      }
    }
    return null
  }
  const block = findBalanced(t)
  if (!block) throw new Error('No JSON object found in AI response')
  try { return JSON.parse(block) } catch (e) {
    // Last-ditch: remove trailing commas
    const cleaned = block.replace(/,(\s*[}\]])/g, '$1')
    return JSON.parse(cleaned)
  }
}

async function callAI({ apiKey, provider, model, system, user }) {
  const headers = {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'x-provider': provider,
  }
  if (model) headers['x-model'] = model
  const resp = await fetch('/api/ai', {
    method: 'POST',
    headers,
    body: JSON.stringify({ system, user, jsonMode: true }),
  })
  const data = await resp.json()
  if (!resp.ok) throw new Error(data?.error || 'AI request failed')
  return data.text
}

export async function extractResumeFromText({ rawText, apiKey, provider, model }) {
  const user = `Extract a structured resume from the raw text below. Return ONLY JSON matching the schema.\n\nRAW RESUME TEXT:\n"""\n${rawText}\n"""`
  const text = await callAI({ apiKey, provider, model, system: BASE_SYSTEM, user })
  return extractJson(text)
}

export async function tailorResumeToJD({ resume, jobDescription, apiKey, provider, model }) {
  const system = `${BASE_SYSTEM}\n\nYou are also an ATS optimization expert. Rewrite bullet points and the professional summary to highlight skills/keywords relevant to the provided Job Description. YOU MUST NOT invent, hallucinate, or add any new jobs, degrees, companies, certifications, or years of experience. Only rephrase EXISTING truths. Keep the same number of jobs, projects, education entries. Preserve dates and company names verbatim.`
  const user = `Tailor this resume JSON to the provided Job Description. Return ONLY the updated JSON matching the schema.\n\nCURRENT RESUME JSON:\n${JSON.stringify(resume, null, 2)}\n\nJOB DESCRIPTION:\n"""\n${jobDescription}\n"""`
  const text = await callAI({ apiKey, provider, model, system, user })
  return extractJson(text)
}
