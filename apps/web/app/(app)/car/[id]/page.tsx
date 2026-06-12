'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSession, getCars, getComponents, createComponent, deleteComponent } from '@autolog/services'
import type { Car, Component } from '@autolog/services'
import Link from 'next/link'

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    troca: { label: 'Troca', color: 'bg-green-100 text-green-700' },
    upgrade: { label: 'Upgrade', color: 'bg-orange-100 text-orange-700' },
    revisao: { label: 'Revisão', color: 'bg-blue-100 text-blue-700' },
    reparo: { label: 'Reparo', color: 'bg-red-100 text-red-700' },
}

function getNextDueLabel(comp: Component): string | null {
    if (!comp.next_due_type || !comp.next_due_value) return null
    if (comp.next_due_type === 'km' && comp.mileage) {
        const next = comp.mileage + comp.next_due_value
        return `Próxima troca: ${next.toLocaleString('pt-BR')} km`
    }
    if (comp.next_due_type === 'months') {
        const d = new Date(comp.date + 'T12:00:00')
        d.setMonth(d.getMonth() + comp.next_due_value)
        return `Próxima troca: ${d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
    }
    return null
}

export default function CarPage() {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [car, setCar] = useState<Car | null>(null)
    const [components, setComponents] = useState<Component[]>([])
    const [tab, setTab] = useState<'history' | 'add'>('history')
    const [mounted, setMounted] = useState(false)

    const [name, setName] = useState('')
    const [type, setType] = useState('troca')
    const [date, setDate] = useState('')
    const [mileage, setMileage] = useState('')
    const [notes, setNotes] = useState('')
    const [nextDueType, setNextDueType] = useState('')
    const [nextDueValue, setNextDueValue] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        setDate(new Date().toISOString().slice(0, 10))
        async function load() {
            const session = await getSession()
            if (!session) { router.push('/login'); return }
            const cars = await getCars()
            const found = cars.find(c => c.id === id)
            if (!found) { router.push('/garage'); return }
            setCar(found)
            const comps = await getComponents(id)
            setComponents(comps)
            setMounted(true)
        }
        load()
    }, [id, router])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!name || !date) { setError('Preencha o nome e a data.'); return }
        setError('')
        setSaving(true)
        try {
            const comp = await createComponent({
                car_id: id,
                name,
                type,
                date,
                mileage: mileage ? Number(mileage) : undefined,
                notes: notes || undefined,
                next_due_type: nextDueType as 'km' | 'months' || null,
                next_due_value: nextDueValue ? Number(nextDueValue) : null,
            })
            setComponents(prev => [comp, ...prev])
            setName(''); setMileage(''); setNotes('')
            setNextDueType(''); setNextDueValue('')
            setTab('history')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(compId: string) {
        await deleteComponent(compId)
        setComponents(prev => prev.filter(c => c.id !== compId))
    }

    if (!mounted) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <Link href="/garage" className="text-green-600 text-sm">← Garagem</Link>
                <div>
                    <p className="font-semibold text-gray-900">{car?.nickname ?? car?.model}</p>
                    <p className="text-xs text-gray-500">{car?.brand} {car?.model} · {car?.year}</p>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                    <button
                        onClick={() => setTab('history')}
                        className={`flex-1 text-sm py-2 rounded-lg transition-colors ${tab === 'history' ? 'bg-white font-medium text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                        Histórico
                    </button>
                    <button
                        onClick={() => setTab('add')}
                        className={`flex-1 text-sm py-2 rounded-lg transition-colors ${tab === 'add' ? 'bg-white font-medium text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                        + Registrar
                    </button>
                </div>

                {tab === 'history' && (
                    components.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <div className="text-5xl mb-3">🔧</div>
                            <p className="text-sm">Nenhum registro ainda.</p>
                            <p className="text-sm">Use a aba "+ Registrar" para adicionar.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {components.map(comp => {
                                const t = TYPE_LABELS[comp.type] ?? { label: comp.type, color: 'bg-gray-100 text-gray-700' }
                                const d = comp.date ? new Date(comp.date + 'T12:00:00').toLocaleDateString('pt-BR') : ''
                                const nextDue = getNextDueLabel(comp)
                                return (
                                    <div key={comp.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900 text-sm">{comp.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${t.color}`}>{t.label}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {d}{comp.mileage ? ` · ${comp.mileage.toLocaleString('pt-BR')} km` : ''}
                                            </p>
                                            {comp.notes && <p className="text-xs text-gray-400 mt-1">{comp.notes}</p>}
                                            {nextDue && (
                                                <p className="text-xs text-orange-500 mt-1 font-medium">🔔 {nextDue}</p>
                                            )}
                                        </div>
                                        <button onClick={() => handleDelete(comp.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
                                    </div>
                                )
                            })}
                        </div>
                    )
                )}

                {tab === 'add' && (
                    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Componente / serviço</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                                placeholder="ex: Filtro de óleo, Pastilha de freio..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            >
                                <option value="troca">🔧 Troca</option>
                                <option value="upgrade">⬆️ Upgrade</option>
                                <option value="revisao">🔍 Revisão</option>
                                <option value="reparo">🛠️ Reparo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Data</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Quilometragem <span className="text-gray-400">(opcional)</span></label>
                            <input
                                type="number"
                                value={mileage}
                                onChange={e => setMileage(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                                placeholder="ex: 58400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Observações <span className="text-gray-400">(opcional)</span></label>
                            <input
                                type="text"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                                placeholder="Marca, fornecedor..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Próxima troca <span className="text-gray-400">(opcional)</span></label>
                            <div className="flex gap-2">
                                <select
                                    value={nextDueType}
                                    onChange={e => { setNextDueType(e.target.value); setNextDueValue('') }}
                                    className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                                >
                                    <option value="">Sem lembrete</option>
                                    <option value="km">Por quilometragem</option>
                                    <option value="months">Por tempo</option>
                                </select>
                                {nextDueType === 'km' && (
                                    <input
                                        type="number"
                                        value={nextDueValue}
                                        onChange={e => setNextDueValue(e.target.value)}
                                        className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                                        placeholder="ex: 10000 km"
                                    />
                                )}
                                {nextDueType === 'months' && (
                                    <select
                                        value={nextDueValue}
                                        onChange={e => setNextDueValue(e.target.value)}
                                        className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="3">3 meses</option>
                                        <option value="6">6 meses</option>
                                        <option value="12">1 ano</option>
                                        <option value="24">2 anos</option>
                                    </select>
                                )}
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar registro'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    )
}