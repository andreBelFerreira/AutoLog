'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, getUser, signOut, getCars, deleteCar } from '@autolog/services'
import type { Car } from '@autolog/services'
import Link from 'next/link'

export default function GaragePage() {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const session = await getSession()
      if (!session) { router.push('/login'); return }
      const user = await getUser()
      setUserName(user?.user_metadata?.name ?? user?.email ?? '')
      const data = await getCars()
      setCars(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  async function handleDeleteCar(id: string) {
    if (!confirm('Remover este carro e todos os registros?')) return
    await deleteCar(id)
    setCars(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Carregando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚗</span>
          <span className="font-semibold text-gray-900">AutoLog</span>
        </div>
        <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-700">
          Sair
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">Olá, {userName} 👋</p>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">Minha garagem</h1>
          <Link
            href="/car/new"
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg"
          >
            + Adicionar carro
          </Link>
        </div>

        {cars.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🅿️</div>
            <p className="text-sm">Nenhum carro cadastrado ainda.</p>
            <p className="text-sm">Clique em "Adicionar carro" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cars.map(car => (
              <div key={car.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{car.nickname ?? car.model}</p>
                    <p className="text-sm text-gray-500">{car.brand} {car.model} · {car.year}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCar(car.id)}
                    className="text-gray-300 hover:text-red-400 text-lg"
                  >
                    ×
                  </button>
                </div>
                <Link
                  href={`/car/${car.id}`}
                  className="mt-3 block text-center text-sm text-green-600 border border-green-200 rounded-lg py-1.5 hover:bg-green-50"
                >
                  Ver registros →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}