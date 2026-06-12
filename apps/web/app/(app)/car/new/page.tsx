'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCar } from '@autolog/services'
import Link from 'next/link'

const BRANDS = ['Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Mitsubishi', 'Nissan', 'Renault', 'Toyota', 'Volkswagen', 'Outra']

export default function NewCarPage() {
    const router = useRouter()
    const [brand, setBrand] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [nickname, setNickname] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        if (!brand || !model || !year) { setError('Preencha marca, modelo e ano.'); return }
        setLoading(true)
        try {
            await createCar({ brand, model, year: Number(year), nickname: nickname || undefined })
            router.push('/garage')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <Link href="/garage" className="text-green-600 text-sm">← Voltar</Link>
                <span className="font-semibold text-gray-900">Adicionar carro</span>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Marca</label>
                        <select
                            value={brand}
                            onChange={e => setBrand(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            required
                        >
                            <option value="">Selecione...</option>
                            {BRANDS.map(b => <option key={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Modelo</label>
                        <input
                            type="text"
                            value={model}
                            onChange={e => setModel(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            placeholder="ex: Onix, HB20, Gol..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Ano</label>
                        <input
                            type="number"
                            value={year}
                            onChange={e => setYear(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            placeholder="ex: 2021"
                            min="1960"
                            max="2026"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Apelido <span className="text-gray-400">(opcional)</span></label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            placeholder="ex: Carrinho da família"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Adicionar carro'}
                    </button>
                </form>
            </main>
        </div>
    )
}