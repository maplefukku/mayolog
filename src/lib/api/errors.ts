import { NextResponse } from 'next/server'

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 })
}

export function gatewayError(message: string) {
  return NextResponse.json({ error: message }, { status: 502 })
}

export function gatewayTimeout(message: string) {
  return NextResponse.json({ error: message }, { status: 504 })
}
