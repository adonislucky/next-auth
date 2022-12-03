import { serialize, parse as parseCookie } from "cookie"
import type { ResponseInternal, RequestInternal } from "../core"
import type { AuthAction } from "../core/types"

const decoder = new TextDecoder()

async function streamToString(stream): Promise<string> {
  const chunks: Uint8Array[] = []
  return await new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on("error", (err) => reject(err))
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
  })
}

async function readJSONBody(
  body: ReadableStream | Buffer
): Promise<Record<string, any> | undefined> {
  try {
    if ("getReader" in body) {
      const reader = body.getReader()
      const bytes: number[] = []
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        bytes.push(...value)
      }
      const b = new Uint8Array(bytes)
      return JSON.parse(decoder.decode(b))
    }

    // node-fetch

    if (typeof Buffer !== "undefined" && Buffer.isBuffer(body)) {
      return JSON.parse(body.toString("utf8"))
    }

    return JSON.parse(await streamToString(body))
  } catch (e) {
    console.error(e)
  }
}

export async function toInternalRequest(
  req: Request
): Promise<RequestInternal> {
  const url = new URL(req.url)
  const nextauth = url.pathname.split("/").slice(3)
  const headers = Object.fromEntries(req.headers)
  const query: Record<string, any> = Object.fromEntries(url.searchParams)

  const cookieHeader = req.headers.get("cookie") ?? ""
  const cookies =
    parseCookie(
      Array.isArray(cookieHeader) ? cookieHeader.join(";") : cookieHeader
    ) ?? {}

  return {
    action: nextauth[0] as AuthAction,
    method: req.method,
    headers,
    body: req.body ? await readJSONBody(req.body) : undefined,
    cookies: cookies,
    providerId: nextauth[1],
    error: url.searchParams.get("error") ?? undefined,
    host: new URL(req.url).origin,
    query,
  }
}

export function toResponse(res: ResponseInternal): Response {
  const headers = new Headers(
    res.headers?.reduce((acc, { key, value }) => {
      acc[key] = value
      return acc
    }, {})
  )

  res.cookies?.forEach((cookie) => {
    const { name, value, options } = cookie
    const cookieHeader = serialize(name, value, options)
    if (headers.has("Set-Cookie")) {
      headers.append("Set-Cookie", cookieHeader)
    } else {
      headers.set("Set-Cookie", cookieHeader)
    }
  })

  const body =
    headers.get("content-type") === "application/json"
      ? JSON.stringify(res.body)
      : res.body

  const response = new Response(body, {
    headers,
    status: res.redirect ? 302 : res.status ?? 200,
  })

  if (res.redirect) {
    response.headers.set("Location", res.redirect)
  }

  return response
}
