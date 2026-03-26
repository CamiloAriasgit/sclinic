import InvoiceScanner from '@/components/InvoiceScanner'
import InventoryList from '@/components/InventoryList'

export const dynamic = 'force-dynamic' 
export const revalidate = 0

export default async function InventoryPage() { 
  return (
    // Quitamos min-h-screen y bg-white porque ya vienen del layout principal
    <div className="w-full">
      <div className="max-w-5xl mx-auto py-6 md:py-12 px-4 md:px-0">
        <div className="space-y-12 md:space-y-20">
          <section>
            <InvoiceScanner />
          </section>
          
          {/* Separador visual sutil solo en desktop */}
          <div className="hidden md:block h-px bg-zinc-100 w-full" />

          <section>
            <InventoryList />
          </section>
        </div>
      </div>
    </div>
  );
}