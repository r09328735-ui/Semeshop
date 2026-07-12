"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ErrorResponse {
  error?: string;
}

export function ContactForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const payload = (await res.json()) as ErrorResponse;
        toast.error(payload.error ?? "Une erreur est survenue.");
        return;
      }
      setSent(true);
      reset();
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="rounded-md border bg-accent p-4 text-sm">
        Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Sujet</Label>
        <Input id="subject" {...register("subject")} />
        {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} {...register("message")} />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Envoi..." : "Envoyer le message"}
      </Button>
    </form>
  );
}
