import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  client: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  description?: string;
  type: 'sopralluogo' | 'consegna' | 'presentazione' | 'altro';
  status: 'confermato' | 'da_confermare' | 'completato' | 'annullato';
  created_at: string;
  updated_at: string;
}

export interface AppointmentFormData {
  title: string;
  client: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  description: string;
  type: 'sopralluogo' | 'consegna' | 'presentazione' | 'altro';
}

export const useAppuntamenti = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;

      setAppointments((data as Appointment[]) || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento degli appuntamenti';
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create appointment
  const createAppointment = async (formData: AppointmentFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const appointmentData = {
        user_id: user.id,
        title: formData.title,
        client: formData.client,
        date: formData.date,
        time: formData.time,
        duration: parseInt(formData.duration),
        location: formData.location,
        description: formData.description || null,
        type: formData.type,
        status: 'da_confermare' as const,
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;

      setAppointments(prev => [...prev, data as Appointment].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      }));

      toast({
        title: "Successo",
        description: "Appuntamento creato con successo",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nella creazione dell\'appuntamento';
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Update appointment
  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAppointments(prev => prev.map(apt => 
        apt.id === id ? data as Appointment : apt
      ).sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      }));

      toast({
        title: "Successo",
        description: "Appuntamento aggiornato con successo",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'aggiornamento dell\'appuntamento';
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Delete appointment
  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.filter(apt => apt.id !== id));

      toast({
        title: "Successo",
        description: "Appuntamento eliminato con successo",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'eliminazione dell\'appuntamento';
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Get this week's appointments
  const getThisWeekAppointments = () => {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && aptDate <= weekFromNow;
    });
  };

  // Load appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetchAppointments: fetchAppointments,
    thisWeekAppointments: getThisWeekAppointments(),
  };
};