import Header from '@/components/Header'
import { createClient } from '@supabase/supabase-js'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 1. Obtener sesión del usuario
    const { createClient: createServerClient } = await import('@/utils/supabase/server')
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const orgId = user?.app_metadata?.organizacion_id || user?.user_metadata?.organizacion_id
    const userInitial = user?.email?.charAt(0).toUpperCase() || 'U'
    const userEmail = user?.email || 'Usuario'

    // 2. Consulta de datos de la clínica (Bypass RLS)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let clinicData = null
    if (orgId) {
        const { data } = await supabaseAdmin
            .from('organizaciones')
            .select('nombre')
            .eq('id', orgId)
            .single()

        clinicData = data
    }

    return (
        <div className="flex min-h-screen bg-white">

            <Header
                userInitial={userInitial}
                userEmail={userEmail}
                clinic={clinicData}
            />


            <main className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col pt-16">
                <div className="flex-1 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}