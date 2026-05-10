"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Store, MapPin, Pencil, Trash2 } from "lucide-react";
import { useDeliveryStore, formatDeliveryAddress } from "@/store/deliveryStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type DeliveryToggleProps = {
  embedded?: boolean;
};

export function DeliveryToggle({ embedded = false }: DeliveryToggleProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  /** Фиксируем при открытии: «Добавить» vs «Сохранить», чтобы подпись не прыгала при вводе */
  const [addressDialogIsNew, setAddressDialogIsNew] = useState(true);

  const {
    type,
    setType,
    address,
    city,
    street,
    house,
    privateHouse,
    entrance,
    doorCode,
    floor,
    apartment,
    addressComment,
    setAddress,
    setCity,
    setStreet,
    setHouse,
    setPrivateHouse,
    setEntrance,
    setDoorCode,
    setFloor,
    setApartment,
    setAddressComment,
  } = useDeliveryStore();

  const hasAddress = Boolean(address?.trim());

  const clearAddress = () => {
    setCity("");
    setStreet("");
    setHouse("");
    setPrivateHouse(false);
    setEntrance("");
    setDoorCode("");
    setFloor("");
    setApartment("");
    setAddressComment("");
    setAddress("");
  };

  const handleDelete = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Удалить сохранённый адрес доставки?");
      if (ok) clearAddress();
    }
  };

  const handleSaveAddress = () => {
    const s = useDeliveryStore.getState();
    setAddress(
      formatDeliveryAddress({
        city: s.city,
        street: s.street,
        house: s.house,
        privateHouse: s.privateHouse,
        entrance: s.entrance,
        doorCode: s.doorCode,
        floor: s.floor,
        apartment: s.apartment,
        addressComment: s.addressComment,
      })
    );
    setDialogOpen(false);
  };

  const shellClass = cn(
    "grid w-full gap-4",
    !embedded &&
      "mx-auto max-w-2xl rounded-[28px] border border-border/60 bg-surface-2/90 p-4 shadow-[0_28px_80px_-28px_rgba(74,60,47,0.35)]",
    embedded &&
      "rounded-2xl border border-border/50 bg-white/95 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] md:p-4"
  );

  return (
    <div className={shellClass}>
      <div className="relative grid grid-cols-2 gap-1.5 rounded-full bg-surface-1 p-1 ring-1 ring-border/70">
        <motion.div
          className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand"
          animate={{ x: type === "DELIVERY" ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        />
        <button
          type="button"
          onClick={() => setType("PICKUP")}
          className={cn(
            "relative z-10 flex min-h-[52px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
            type === "PICKUP" ? "text-white" : "text-text-2"
          )}
        >
          <Store className="h-4 w-4" />
          Самовывоз
        </button>
        <button
          type="button"
          onClick={() => setType("DELIVERY")}
          className={cn(
            "relative z-10 flex min-h-[52px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
            type === "DELIVERY" ? "text-white" : "text-text-2"
          )}
        >
          <Truck className="h-4 w-4" />
          Доставка
        </button>
      </div>

      {type === "DELIVERY" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (open) {
                setAddressDialogIsNew(!useDeliveryStore.getState().address?.trim());
              }
            }}
          >
            <div className="flex flex-col gap-3">
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-center gap-2 rounded-2xl border-2 font-semibold shadow-sm transition-colors",
                    embedded
                      ? "border-brand/40 bg-brand/[0.06] hover:bg-brand/[0.1]"
                      : "border-border hover:bg-surface-2"
                  )}
                >
                  {hasAddress ? (
                    <>
                      <Pencil className="h-4 w-4" />
                      Изменить адрес
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Добавить адрес
                    </>
                  )}
                </Button>
              </DialogTrigger>

              <div className="rounded-2xl border border-border/70 bg-surface-1 p-4 shadow-sm md:p-5">
                {!hasAddress ? (
                  <div className="flex gap-3 text-sm leading-relaxed text-text-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text-3">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-text">Адрес не указан</p>
                      <p className="mt-1 text-[13px] md:text-sm">
                        Нажмите кнопку выше и заполните форму — так курьер сможет
                        привезти заказ без лишних звонков.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-3">
                          Доставка по адресу
                        </p>
                        <p className="mt-2 whitespace-pre-line text-[15px] font-medium leading-relaxed text-text">
                          {address}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="rounded-full px-4"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Редактировать
                        </Button>
                      </DialogTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-error hover:bg-error/10 hover:text-error"
                        onClick={handleDelete}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Удалить
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <DialogContent className="flex max-h-[min(90vh,720px)] max-w-[min(calc(100vw-1.5rem),26rem)] flex-col gap-0 overflow-hidden rounded-[26px] border-border/60 bg-[#FFFCF9] p-0 shadow-[0_32px_80px_-24px_rgba(74,60,47,0.45)]">
              <div className="shrink-0 border-b border-border/50 bg-gradient-to-br from-surface-2/80 to-transparent px-6 pb-5 pt-7">
                <DialogHeader className="space-y-2 text-left">
                  <DialogTitle className="font-display text-xl font-bold tracking-tight text-text md:text-[1.35rem]">
                    Адрес доставки
                  </DialogTitle>
                  <p className="text-[13px] leading-relaxed text-text-2">
                    Заполните поля — данные сохранятся в этом браузере для следующих
                    заказов.
                  </p>
                </DialogHeader>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-text">
                      Город
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-11 rounded-xl border-border/80 bg-white"
                      placeholder="Например, Москва"
                      autoComplete="address-level2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-text">
                      Улица
                    </Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="h-11 rounded-xl border-border/80 bg-white"
                      placeholder="Улица и проспект"
                      autoComplete="street-address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="house" className="text-text">
                      Дом
                    </Label>
                    <Input
                      id="house"
                      value={house}
                      onChange={(e) => setHouse(e.target.value)}
                      className="h-11 rounded-xl border-border/80 bg-white"
                      placeholder="Номер дома"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="entrance">Подъезд</Label>
                      <Input
                        id="entrance"
                        value={entrance}
                        onChange={(e) => setEntrance(e.target.value)}
                        className="h-11 rounded-xl border-border/80 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doorCode">Код двери</Label>
                      <Input
                        id="doorCode"
                        value={doorCode}
                        onChange={(e) => setDoorCode(e.target.value)}
                        className="h-11 rounded-xl border-border/80 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="floor">Этаж</Label>
                      <Input
                        id="floor"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        className="h-11 rounded-xl border-border/80 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment">Квартира / офис</Label>
                      <Input
                        id="apartment"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="h-11 rounded-xl border-border/80 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface-2/50 px-4 py-3">
                    <Label htmlFor="private-house" className="mb-0 cursor-pointer text-[15px] font-medium">
                      Частный дом
                    </Label>
                    <Switch
                      id="private-house"
                      checked={privateHouse}
                      onCheckedChange={(value) => setPrivateHouse(Boolean(value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressComment">Комментарий для курьера</Label>
                    <Textarea
                      id="addressComment"
                      value={addressComment}
                      onChange={(e) => setAddressComment(e.target.value)}
                      placeholder="Домофон, как позвонить, что сказать охране…"
                      className="min-h-[100px] resize-none rounded-xl border-border/80 bg-white text-[15px] leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border/50 bg-surface-2/30 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="h-11 rounded-full sm:min-w-[8rem]">
                    Отмена
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  className="h-11 rounded-full sm:min-w-[11rem]"
                  onClick={handleSaveAddress}
                >
                  {addressDialogIsNew ? "Добавить адрес" : "Сохранить адрес"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </div>
  );
}
