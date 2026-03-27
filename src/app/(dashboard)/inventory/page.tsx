import InvoiceScanner from '@/components/InvoiceScanner'
import InventoryList from '@/components/InventoryList'

export const dynamic = 'force-dynamic' 
export const revalidate = 0

export default async function InventoryPage() { 
  return (
    <main className="min-h-screen bg-zinc-50/50"> {/* Un fondo sutil para contrastar con tarjetas blancas */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:gap-16">
          
          <section aria-label="Escaneo de facturas">
            <InvoiceScanner />
          </section>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
          </div>

          <section aria-label="Lista de inventario">
            <InventoryList />
          </section>
        </div>
      </div>
    </main>
  );
}