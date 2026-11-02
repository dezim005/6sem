"use client";

import * as React from "react";
import type { ParkingSpot, Reservation } from "@/types";
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
import { format, startOfDay, isEqual } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { isCalendarDayBookable, rangeIsBookable } from "@/lib/bookable-days";

const API_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "https://gateway-api-d2uo.onrender.com";

interface SpotReservationDialogProps {
  spot: ParkingSpot | null;
  allReservations: Reservation[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmReservation: (spotId: string, dateRange: DateRange) => Promise<boolean>;
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
  const { user } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      setSelectedDateRange(undefined);
    }
  }, [isOpen, spot]);

  if (!spot) {
    return null;
  }

  const spotReservations = allReservations.filter(res => res.spotId === spot.id);

  const disabledDaysFunc = (day: Date): boolean => {
    return !isCalendarDayBookable(day, spot.availability, spotReservations);
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
    
    const periodEnd = selectedDateRange.to || selectedDateRange.from;
    if (!rangeIsBookable(selectedDateRange.from, periodEnd, spot.availability, spotReservations)) {
      toast({
        title: "Período Inválido",
        description: "O intervalo selecionado não está livre para reserva.",
        variant: "destructive",
      });
      return;
    }

    const reserved = await onConfirmReservation(spot.id, selectedDateRange);
    if (!reserved || !user) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          title: 'Reserva Confirmada',
          message: 'Sua vaga foi reservada com sucesso no sistema Vaga Livre!',
          type: 'RESERVA_CONFIRMADA',
        }),
      });

      if (!response.ok) {
        toast({
          title: "Aviso",
          description: "Reserva efetuada, mas a notificação não foi enviada.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Aviso",
        description: "Reserva efetuada, mas a notificação não foi enviada.",
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
                        modifiers={{ reservable: (day) => !disabledDaysFunc(day) }}
                        modifiersClassNames={{
                          reservable: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                        }}
                        classNames={{ day_today: "text-foreground" }}
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