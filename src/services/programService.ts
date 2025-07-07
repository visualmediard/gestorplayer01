import { supabase } from '../config/supabase'
import { Program } from '../types/content'

export class ProgramService {
  private static instance: ProgramService
  private isSupabaseEnabled = false
  private connectionChecked = false

  static getInstance(): ProgramService {
    if (!ProgramService.instance) {
      ProgramService.instance = new ProgramService()
    }
    return ProgramService.instance
  }

  constructor() {
    this.initializeConnection()
  }

  private async initializeConnection() {
    await this.checkSupabaseConnection()
    this.connectionChecked = true
  }

  private async checkSupabaseConnection() {
    try {
      const { error } = await supabase
        .from('programs')
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Tabla no existe, pero conexión OK
          this.isSupabaseEnabled = true
        } else {
          this.isSupabaseEnabled = false
        }
      } else {
        this.isSupabaseEnabled = true
      }
    } catch (error) {
      this.isSupabaseEnabled = false
    }
  }

  // Obtener todos los programas
  async getPrograms(): Promise<Program[]> {
    // Asegurar que la conexión esté verificada
    if (!this.connectionChecked) {
      await this.checkSupabaseConnection()
      this.connectionChecked = true
    }
    
    if (this.isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          return this.getLocalPrograms()
        }

        // Mapear datos de Supabase a nuestro formato
        const mappedPrograms = data?.map(item => this.mapSupabaseToProgram(item)) || []
        return mappedPrograms
      } catch (error) {
        return this.getLocalPrograms()
      }
    }
    
    return this.getLocalPrograms()
  }

  // Crear nuevo programa
  async createProgram(program: Program): Promise<{ success: boolean; data?: Program; error?: string }> {
    if (this.isSupabaseEnabled) {
      try {
        const programData = {
          id: program.id,
          name: program.name,
          width: program.width,
          height: program.height,
          zones: program.zones || [],
          content: program.content || 0,
          last_modified: program.lastModified,
          description: program.description,
          created_at: program.createdAt
        }

        const { data, error } = await supabase
          .from('programs')
          .insert([programData])
          .select()
          .single()

        if (error) {
          return this.createLocalProgram(program)
        }

        return { success: true, data: this.mapSupabaseToProgram(data) }
      } catch (error) {
        return this.createLocalProgram(program)
      }
    }

    return this.createLocalProgram(program)
  }

  // Actualizar programa
  async updateProgram(program: Program): Promise<{ success: boolean; data?: Program; error?: string }> {
    if (this.isSupabaseEnabled) {
      try {
        const programData = {
          name: program.name,
          width: program.width,
          height: program.height,
          zones: program.zones || [],
          content: program.content || 0,
          last_modified: program.lastModified,
          description: program.description
        }

        const { data, error } = await supabase
          .from('programs')
          .update(programData)
          .eq('id', program.id)
          .select()
          .single()

        if (error) {
          return this.updateLocalProgram(program)
        }

        return { success: true, data: this.mapSupabaseToProgram(data) }
      } catch (error) {
        return this.updateLocalProgram(program)
      }
    }

    return this.updateLocalProgram(program)
  }

  // Eliminar programa
  async deleteProgram(programId: string): Promise<{ success: boolean; error?: string }> {
    if (this.isSupabaseEnabled) {
      try {
        const { error } = await supabase
          .from('programs')
          .delete()
          .eq('id', programId)

        if (error) {
          return this.deleteLocalProgram(programId)
        }

        return { success: true }
      } catch (error) {
        return this.deleteLocalProgram(programId)
      }
    }

    return this.deleteLocalProgram(programId)
  }

  // Métodos de localStorage como fallback
  private getLocalPrograms(): Program[] {
    try {
      const saved = localStorage.getItem('gestorplayer-programs')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      return []
    }
  }

  private createLocalProgram(program: Program): { success: boolean; data?: Program; error?: string } {
    try {
      const programs = this.getLocalPrograms()
      programs.push(program)
      localStorage.setItem('gestorplayer-programs', JSON.stringify(programs))
      return { success: true, data: program }
    } catch (error) {
      return { success: false, error: 'Error guardando en localStorage' }
    }
  }

  private updateLocalProgram(program: Program): { success: boolean; data?: Program; error?: string } {
    try {
      const programs = this.getLocalPrograms()
      const index = programs.findIndex(p => p.id === program.id)
      if (index >= 0) {
        programs[index] = program
        localStorage.setItem('gestorplayer-programs', JSON.stringify(programs))
        return { success: true, data: program }
      }
      return { success: false, error: 'Programa no encontrado' }
    } catch (error) {
      return { success: false, error: 'Error actualizando en localStorage' }
    }
  }

  private deleteLocalProgram(programId: string): { success: boolean; error?: string } {
    try {
      const programs = this.getLocalPrograms()
      const filtered = programs.filter(p => p.id !== programId)
      localStorage.setItem('gestorplayer-programs', JSON.stringify(filtered))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Error eliminando de localStorage' }
    }
  }

  // Mapear datos de Supabase a nuestro tipo Program
  private mapSupabaseToProgram(data: any): Program {
    const zones = Array.isArray(data.zones) ? data.zones : [];
    const totalContent = zones.reduce((sum: number, zone: any) => {
      return sum + (Array.isArray(zone.content) ? zone.content.length : 0);
    }, 0);

    return {
      id: data.id,
      name: data.name,
      width: data.width,
      height: data.height,
      zones: zones,
      content: totalContent,
      lastModified: data.last_modified,
      createdAt: data.created_at,
      description: data.description
    }
  }

  // Sincronizar datos entre localStorage y Supabase
  async syncData(): Promise<void> {
    if (!this.isSupabaseEnabled) return

    try {
      const localPrograms = this.getLocalPrograms()
      const { data: remotePrograms } = await supabase.from('programs').select('*')

      // Si hay programas locales pero no remotos, subir locales
      if (localPrograms.length > 0 && (!remotePrograms || remotePrograms.length === 0)) {
        console.log('Sincronizando programas locales a Supabase...')
        for (const program of localPrograms) {
          await this.createProgram(program)
        }
      }
    } catch (error) {
      console.error('Error sincronizando datos:', error)
    }
  }

  // Limpiar todos los datos locales
  clearLocalData(): void {
    try {
      localStorage.removeItem('gestorplayer-programs')
      console.log('✅ Datos locales limpiados')
    } catch (error) {
      console.error('Error limpiando datos locales:', error)
    }
  }

  // Obtener estadísticas
  async getStats(): Promise<{ total: number; local: number; remote: number }> {
    const localPrograms = this.getLocalPrograms()
    let remoteCount = 0

    if (this.isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('id', { count: 'exact', head: true })
        
        if (!error) {
          remoteCount = data?.length || 0
        }
      } catch (error) {
        console.error('Error obteniendo estadísticas remotas:', error)
      }
    }

    return {
      total: Math.max(localPrograms.length, remoteCount),
      local: localPrograms.length,
      remote: remoteCount
    }
  }
} 