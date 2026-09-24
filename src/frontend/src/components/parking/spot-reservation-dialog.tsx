"use client";

import * as React from "react";
import type { ParkingSpot, Reservation, AvailabilitySlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Loader2, AlertTriangle, MapPin } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { format, startOfDay, endOfDay, eachDayOfInterval, isEqual } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'https://vaga-livre-backend.onrender.com';

interface SpotReservationDialogProps {
  spot: ParkingSpot | null;
  allReservations: Reservation[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmReservation: (spotId: string, dateRange: DateRange) => Promise<void>;
  isSubmitting: boolean;
}

export function SpotReservationDialog({
  spot,
  allReservations,
  isOpen,
  onOpenChange,
  onConfirmReservation,
  isSubmitting
}: SpotReservationDialogProps) {
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange | undefined>(undefined);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      setSelectedDateRange(undefined);
    }
  }, [isOpen, spot]);

  if (!spot) {
    return null;
  }

  const spotReservations = allReservations.filter(res => res.spotId === spot.id);

  const isDayBooked = (day: Date): boolean => {
    const dayStart = startOfDay(day);
    return spotReservations.some(res => {
      const resStart = startOfDay(new Date(res.startTime));
      const resEnd = endOfDay(new Date(res.endTime));
      return dayStart >= resStart && dayStart <= resEnd;
    });
  };

  const isDayWithinAvailability = (day: Date, availabilitySlots: AvailabilitySlot[]): boolean => {
    const targetDayStart = startOfDay(day);
    return availabilitySlots.some(slot => {
      const slotStart = startOfDay(new Date(slot.startTime));
      const slotEnd = endOfDay(new Date(slot.endTime));
      return targetDayStart >= slotStart && targetDayStart <= slotEnd;
    });
  };
  
  const disabledDaysFunc = (day: Date): boolean => {
    if (day < startOfDay(new Date())) return true; 
    if (!spot.availability || spot.availability.length === 0) return true; 

    const dayIsAvailable = isDayWithinAvailability(day, spot.availability);
    if (!dayIsAvailable) return true; 
    
    return isDayBooked(day); 
  };

  const handleConfirmClick = async () => {
    if (!selectedDateRange || !selectedDateRange.from) {
      toast({
        title: "Seleção Inválida",
        description: "Por favor, selecione um período no calendário.",
        variant: "destructive",
      });
      return;
    }
    
    const range = eachDayOfInterval({
        start: selectedDateRange.from,
        end: selectedDateRange.to || selectedDateRange.from,
    });

    for (const day of range) {
        if (disabledDaysFunc(day)) {
             toast({
                title: "Período Inválido",
                description: `O dia ${format(day, "PPP", { locale: ptBR})} no intervalo selecionado não está disponível.`,
                variant: "destructive",
            });
            return;
        }
    }
    
    try {
      // 1. Recupera os dados do usuário logado salvos no navegador
      const storedUser = localStorage.getItem('@VagaLivre:user') || localStorage.getItem('user');
      const usuarioLogado = storedUser ? JSON.parse(storedUser) : null;

      // 2. Valida se o usuário está de fato autenticado
      if (!usuarioLogado || !usuarioLogado.email) {
        toast({
          title: "Sessão Expirada",
          description: "O e-mail do usuário não foi encontrado. Por favor, faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      // 3. Salva a reserva no sistema
      await onConfirmReservation(spot.id, selectedDateRange);

      // 4. Dispara a notificação passando os dados reais do usuário
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: usuarioLogado.id,
          userEmail: usuarioLogado.email,
          title: 'Reserva Confirmada',
          message: `Olá, ${usuarioLogado.name || usuarioLogado.nome || 'Morador'}! Sua reserva para a vaga ${spot.number} foi confirmada com sucesso!`, 
          type: 'RESERVA_CONFIRMADA',
        }),
      });

      if (response.ok) {
        toast({
          title: "Reserva Confirmada!",
          description: `Sua vaga foi reservada com sucesso e um e-mail de confirmação foi enviado para ${usuarioLogado.email}.`,
        });
      } else {
        const errorData = await response.json();
        console.error('Erro na API de Notificações:', errorData);
        toast({
          title: "Aviso",
          description: "Reserva efetuada, mas ocorreu um erro ao enviar a notificação por e-mail.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Erro ao conectar com o backend:', error);
      toast({
          title: "Aviso",
          description: "Reserva efetuada, mas não foi possível conectar ao serviço de notificações.",
          variant: "destructive",
      });
    }
  };

  const spotTypeTranslations: Record<ParkingSpot['type'], string> = {
    compact: 'Compacto',
    standard: 'Padrão',
    suv: 'SUV',
    motorcycle: 'Moto'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reservar Vaga: {spot.number}</DialogTitle>
          <DialogDescription>
            <span className="flex items-center"><MapPin size={16} className="mr-1" /> {spot.location} - Tipo: {spotTypeTranslations[spot.type]}</span>
            Selecione o período desejado no calendário abaixo. Apenas os dias disponíveis para esta vaga são mostrados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto p-1 pr-2">
            {!spot.availability || spot.availability.length === 0 ? (
                 <Card className="my-4 border-destructive bg-destructive/10">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center">
                            <AlertTriangle className="mr-2" /> Indisponível
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-destructive-foreground">
                            O proprietário ainda não definiu os períodos de disponibilidade para esta vaga.
                        </p>
                    </CardContent>
                 </Card>
            ) : (
                <div className="flex flex-col items-center">
                     <Calendar
                        mode="range"
                        selected={selectedDateRange}
                        onSelect={setSelectedDateRange}
                        disabled={disabledDaysFunc}
                        locale={ptBR}
                        numberOfMonths={typeof window !== 'undefined' && window.innerWidth >= 768 ? 2 : 1}
                        className="rounded-md border"
                        fromDate={startOfDay(new Date())}
                     />
                     {selectedDateRange?.from && (
                        <p className="mt-3 text-sm text-muted-foreground">
                            Período selecionado: {format(selectedDateRange.from, "PPP", { locale: ptBR })}
                            {selectedDateRange.to && !isEqual(startOfDay(selectedDateRange.from), startOfDay(selectedDateRange.to)) 
                                ? ` - ${format(selectedDateRange.to, "PPP", { locale: ptBR })}`
                                : ""}
                        </p>
                     )}
                </div>
            )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleConfirmClick} 
            disabled={isSubmitting || !selectedDateRange?.from || (!spot.availability || spot.availability.length === 0)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Reserva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}