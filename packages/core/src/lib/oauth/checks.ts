import * as o from "oauth4webapi"
import { InvalidCheck } from "../../errors.js"
import { encode, decode } from "../../jwt.js"

import type {
  CookiesOptions,
  InternalOptions,
  RequestInternal,
} from "../../types.js"
import type { Cookie } from "../cookie.js"

interface CheckPayload {
  value: string
}

/** Returns a signed cookie. */
export async function signCookie(
  type: keyof CookiesOptions,
  value: string,
  maxAge: number,
  options: InternalOptions<"oauth">
): Promise<Cookie> {
  const { cookies, logger } = options

  logger.debug(`CREATE_${type.toUpperCase()}`, { value, maxAge })

  const expires = new Date()
  expires.setTime(expires.getTime() + maxAge * 1000)
  return {
    name: cookies[type].name,
    value: await encode<CheckPayload>({
      ...options.jwt,
      maxAge,
      token: { value },
    }),
    options: { ...cookies[type].options, expires },
  }
}

const PKCE_MAX_AGE = 60 * 15 // 15 minutes in seconds
export const pkce = {
  async create(options: InternalOptions<"oauth">) {
    const code_verifier = o.generateRandomCodeVerifier()
    const value = await o.calculatePKCECodeChallenge(code_verifier)
    const maxAge = PKCE_MAX_AGE
    const cookie = await signCookie(
      "pkceCodeVerifier",
      code_verifier,
      maxAge,
      options
    )
    return { cookie, value }
  },
  /**
   * Returns code_verifier if the provider is configured to use PKCE,
   * and clears the container cookie afterwards.
   * An error is thrown if the code_verifier is missing or invalid.
   * @see https://www.rfc-editor.org/rfc/rfc7636
   * @see https://danielfett.de/2020/05/16/pkce-vs-nonce-equivalent-or-not/#pkce
   */
  async use(
    cookies: RequestInternal["cookies"],
    resCookies: Cookie[],
    options: InternalOptions<"oauth">
  ): Promise<string | undefined> {
    const { provider } = options

    if (!provider?.checks?.includes("pkce")) return

    const codeVerifier = cookies?.[options.cookies.pkceCodeVerifier.name]

    if (!codeVerifier)
      throw new InvalidCheck("PKCE code_verifier cookie was missing.")

    const value = await decode<CheckPayload>({
      ...options.jwt,
      token: codeVerifier,
    })

    if (!value?.value)
      throw new InvalidCheck("PKCE code_verifier value could not be parsed.")

    // Clear the pkce code verifier cookie after use
    resCookies.push({
      name: options.cookies.pkceCodeVerifier.name,
      value: "",
      options: { ...options.cookies.pkceCodeVerifier.options, maxAge: 0 },
    })

    return value.value
  },
}

const STATE_MAX_AGE = 60 * 15 // 15 minutes in seconds
export const state = {
  async create(options: InternalOptions<"oauth">) {
    if (!options.provider.checks.includes("state")) return
    // TODO: support customizing the state
    const value = o.generateRandomState()
    const maxAge = STATE_MAX_AGE
    const cookie = await signCookie("state", value, maxAge, options)
    return { cookie, value }
  },
  /**
   * Returns state if the provider is configured to use state,
   * and clears the container cookie afterwards.
   * An error is thrown if the state is missing or invalid.
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-10.12
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.1
   */
  async use(
    cookies: RequestInternal["cookies"],
    resCookies: Cookie[],
    options: InternalOptions<"oauth">
  ): Promise<string | undefined> {
    const { provider } = options
    if (!provider.checks.includes("state")) return

    const state = cookies?.[options.cookies.state.name]

    if (!state) throw new InvalidCheck("State cookie was missing.")

    // IDEA: Let the user do something with the returned state
    const value = await decode<CheckPayload>({ ...options.jwt, token: state })

    if (!value?.value)
      throw new InvalidCheck("State value could not be parsed.")

    // Clear the state cookie after use
    resCookies.push({
      name: options.cookies.state.name,
      value: "",
      options: { ...options.cookies.state.options, maxAge: 0 },
    })

    return value.value
  },
}

const NONCE_MAX_AGE = 60 * 15 // 15 minutes in seconds
export const nonce = {
  async create(options: InternalOptions<"oauth">) {
    if (!options.provider.checks.includes("nonce")) return
    const value = o.generateRandomNonce()
    const maxAge = NONCE_MAX_AGE
    const cookie = await signCookie("nonce", value, maxAge, options)
    return { cookie, value }
  },
  /**
   * Returns nonce if the provider is configured to use nonce,
   * and clears the container cookie afterwards.
   * An error is thrown if the nonce is missing or invalid.
   * @see https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes
   * @see https://danielfett.de/2020/05/16/pkce-vs-nonce-equivalent-or-not/#nonce
   */
  async use(
    cookies: RequestInternal["cookies"],
    resCookies: Cookie[],
    options: InternalOptions<"oauth">
  ): Promise<string | undefined> {
    const { provider } = options

    if (!provider?.checks?.includes("nonce")) return

    const nonce = cookies?.[options.cookies.nonce.name]
    if (!nonce) throw new InvalidCheck("Nonce cookie was missing.")

    const value = await decode<CheckPayload>({ ...options.jwt, token: nonce })

    if (!value?.value)
      throw new InvalidCheck("Nonce value could not be parsed.")

    // Clear the nonce cookie after use
    resCookies.push({
      name: options.cookies.nonce.name,
      value: "",
      options: { ...options.cookies.nonce.options, maxAge: 0 },
    })

    return value.value
  },
}
