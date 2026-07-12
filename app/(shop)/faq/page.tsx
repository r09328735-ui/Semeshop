import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = { title: "FAQ" };

const FAQ_ITEMS = [
  {
    question: "Quels sont les délais de livraison ?",
    answer:
      "Les délais varient selon le mode de livraison choisi lors de la commande, généralement entre 2 et 7 jours ouvrés. Vous pouvez suivre l'état de votre commande depuis votre espace client.",
  },
  {
    question: "Comment suivre ma commande ?",
    answer:
      "Rendez-vous dans votre espace client, section \"Mes commandes\". Vous y trouverez le statut de chaque commande ainsi que le numéro de suivi dès qu'il est disponible.",
  },
  {
    question: "Puis-je annuler ma commande ?",
    answer:
      "Oui, tant que votre commande n'a pas encore été expédiée. Rendez-vous dans votre espace client pour demander l'annulation.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Le paiement se fait exclusivement à la livraison, en espèces ou par mobile money. Aucun paiement en ligne n'est requis pour commander.",
  },
  {
    question: "Comment vous contacter ?",
    answer:
      "Le plus rapide est de nous écrire directement sur WhatsApp — un bouton de contact est disponible sur le site. Vous pouvez aussi utiliser le formulaire de la page Contact.",
  },
  {
    question: "Comment retourner un article ?",
    answer:
      "Consultez notre politique de retour pour connaître les conditions et la marche à suivre pour retourner un article.",
  },
  {
    question: "Comment laisser un avis sur un produit ?",
    answer:
      "Une fois votre commande livrée, rendez-vous sur la fiche du produit acheté depuis votre historique de commandes pour déposer un avis.",
  },
];

export default function FaqPage(): JSX.Element {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-6 text-3xl font-semibold">Questions fréquentes</h1>
      <Accordion type="single" collapsible>
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
