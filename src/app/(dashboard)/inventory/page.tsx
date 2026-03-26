import InvoiceScanner from '@/components/InvoiceScanner'
import InventoryList from '@/components/InventoryList'

export const dynamic = 'force-dynamic' 
export const revalidate = 0

export default async function InventoryPage() { 
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto py-12">
        <header className="mb-16 border-b border-zinc-100 pb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-zinc-900 rounded-full" />
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tighter uppercase">
              Inventory <span className="text-zinc-300 font-light">Control</span>
            </h1>
          </div>
          <p className="text-zinc-500 font-medium ml-5">Sincronización de activos médicos y trazabilidad de lotes.</p>
        </header>
        
        <div className="space-y-20">
          <section>
            <InvoiceScanner />
          </section>
          
          <section className="pt-10">
            <InventoryList />
          </section>
        </div>
      </div>
    </main>
  );
}