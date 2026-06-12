'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@autolog/services'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }
        setLoading(true)
        try {
            await signUp(name, email, password)
            router.push('/garage')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao criar conta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🚗</div>
                    <h1 className="text-2xl font-semibold text-gray-900">Criar conta</h1>
                    <p className="text-sm text-gray-500 mt-1">Comece a controlar sua manutenção</p>
                </div>
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Nome completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            placeholder="Seu nome"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? 'Criando conta...' : 'Criar conta'}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                        Já tem conta?{' '}
                        <Link href="/login" className="text-green-600 hover:underline">
                            Fazer login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}