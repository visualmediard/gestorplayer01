export declare const CREATE_TABLE_SQL = "\n-- Crear tabla de programas desde cero\nCREATE TABLE public.programs (\n    id TEXT PRIMARY KEY,\n    name TEXT NOT NULL,\n    width INTEGER NOT NULL,\n    height INTEGER NOT NULL,\n    zones JSONB DEFAULT '[]'::jsonb,\n    content INTEGER DEFAULT 0,\n    last_modified TEXT,\n    description TEXT,\n    created_at TIMESTAMPTZ DEFAULT now()\n);\n\n-- Habilitar Row Level Security (RLS)\nALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;\n\n-- Crear pol\u00EDtica para permitir todas las operaciones\nCREATE POLICY \"Allow all operations\" ON public.programs\n    FOR ALL USING (true);\n\n-- Crear \u00EDndice para mejorar rendimiento\nCREATE INDEX idx_programs_created_at ON public.programs(created_at);\n\n-- Verificar que la tabla se cre\u00F3 correctamente\nSELECT * FROM public.programs;\n";
export declare const RESET_SUPABASE_SQL = "\n-- Eliminar la tabla programs si existe\nDROP TABLE IF EXISTS public.programs CASCADE;\n\n-- Eliminar pol\u00EDticas RLS si existen  \nDROP POLICY IF EXISTS \"Allow all operations\" ON public.programs;\n";
export declare function setupSupabase(): Promise<{
    success: boolean;
    error: string;
    sql: string;
    needsManualSetup: boolean;
    code?: undefined;
    permissions?: undefined;
    message?: undefined;
    details?: undefined;
} | {
    success: boolean;
    error: string;
    code: string;
    sql?: undefined;
    needsManualSetup?: undefined;
    permissions?: undefined;
    message?: undefined;
    details?: undefined;
} | {
    success: boolean;
    error: string;
    permissions: boolean;
    sql?: undefined;
    needsManualSetup?: undefined;
    code?: undefined;
    message?: undefined;
    details?: undefined;
} | {
    success: boolean;
    message: string;
    error?: undefined;
    sql?: undefined;
    needsManualSetup?: undefined;
    code?: undefined;
    permissions?: undefined;
    details?: undefined;
} | {
    success: boolean;
    error: string;
    details: any;
    sql?: undefined;
    needsManualSetup?: undefined;
    code?: undefined;
    permissions?: undefined;
    message?: undefined;
}>;
export declare function showManualSetupInstructions(): void;
