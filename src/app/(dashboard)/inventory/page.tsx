import InvoiceScanner from '@/components/InvoiceScanner'
import InventoryList from '@/components/InventoryList'

export const dynamic = 'force-dynamic' 
export const revalidate = 0

export default async function InventoryPage() { 
  return (
    <main className="min-h-screen bg-zinc-50/50"> {/* Un fondo sutil para contrastar con tarjetas blancas */}
      <div className="mx-auto">
        <div className="grid grid-cols-1 gap-10 md:gap-16">
          
          <section aria-label="Escaneo de facturas">
            <InvoiceScanner />
          </section>

          <section aria-label="Lista de inventario">
            <InventoryList />
          </section>
        </div>
      </div>
    </main>
  );
}