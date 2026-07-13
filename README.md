# SemevoShop

Boutique en ligne complète — site public, espace client et espace administrateur.
Paiement à la livraison (espèces / mobile money), contact client via WhatsApp,
base de données MongoDB.

## Stack technique

- **Framework** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : API Routes Next.js
- **Base de données** : MongoDB + Prisma ORM
- **Authentification** : NextAuth.js (email/mot de passe + Google OAuth optionnel), rôles `USER` / `ADMIN`
- **Paiement** : aucun paiement en ligne — commandes payées à la livraison
- **Contact client** : WhatsApp (pas d'envoi d'email)
- **Images** : stockées directement dans MongoDB (compression automatique via `sharp`), servies par `/api/media/[id]`
- **Factures** : générées en PDF avec `pdf-lib`
- **UI** : shadcn/ui (composants maison) + Lucide icons
- **Graphiques admin** : Recharts
- **Éditeur de texte riche** : Tiptap (description produit)
- **Glisser-déposer** : dnd-kit (réorganisation des images produit)

## Fonctionnalités

### Site public
- Accueil (bannière, produits mis en avant, nouveautés, catégories populaires)
- Catalogue avec filtres (catégorie, prix, disponibilité, note), tri, recherche instantanée, pagination
- Page produit (galerie zoomable, variantes, stock en temps réel, avis, produits similaires)
- Panier persistant (localStorage, synchronisé à la connexion), codes promo
- Tunnel de commande (adresses, mode de livraison, récapitulatif, paiement à la livraison)
- Pages légales, FAQ, contact (formulaire + bouton WhatsApp), SEO (sitemap, robots.txt, données structurées)

### Espace client (`/account`)
- Inscription / connexion / déconnexion (mot de passe oublié → contact WhatsApp)
- Tableau de bord, historique de commandes, facture PDF, annulation de commande
- Profil (nom, téléphone, photo, mot de passe), carnet d'adresses
- Liste de souhaits, dépôt d'avis (note + photo) sur les produits achetés
- Suppression de compte

### Espace admin (`/admin`, rôle `ADMIN`)
- Dashboard (chiffre d'affaires, panier moyen, ventes, alertes de stock)
- Produits (CRUD complet, variantes, images par glisser-déposer, duplication)
- Catégories (imbriquées, réorganisation)
- Commandes (statut, suivi, facture, remboursement)
- Clients (blocage, réinitialisation de mot de passe)
- Avis (modération, réponse)
- Promotions (codes promo)
- Paramètres (boutique, livraison, taxes)

## Prérequis

- Node.js ≥ 18.18
- Une base de données MongoDB (Atlas recommandé — un cluster **replica set** est requis, ce qui est le cas par défaut sur Atlas, y compris sur le tier gratuit M0)

## Installation

```bash
npm install
cp .env.example .env
# renseignez .env (voir section suivante)
npx prisma generate
npx prisma db push   # crée les collections/index dans MongoDB (pas de migrations avec Mongo)
npm run prisma:seed  # crée un compte admin, un compte client et des produits de démonstration
npm run dev
```

L'application est disponible sur http://localhost:3000.

### Supprimer les données de démonstration

Une fois vos propres produits ajoutés, vous pouvez retirer les données injectées par le seed
(produits de démo, compte client de test et ses commandes/avis) tout en conservant le compte
admin et la configuration boutique (livraison, taxes, paramètres) :

```bash
npm run prisma:clean-test-data
```

## Variables d'environnement

Copiez `.env.example` en `.env` et renseignez :

| Variable | Description |
|---|---|
| `DATABASE_URL` | Chaîne de connexion MongoDB (`mongodb+srv://user:motdepasse@cluster.mongodb.net/semevoshop`). **N'oubliez pas le nom de la base après le nom d'hôte.** |
| `NEXTAUTH_URL` | URL de l'application (`http://localhost:3000` en local) |
| `NEXTAUTH_SECRET` | Secret aléatoire — générez-le avec `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optionnel — active la connexion Google si renseigné |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optionnel — active le rate limiting distribué (recommandé en production). Sans ça, un rate limiting en mémoire est utilisé (suffisant en local, pas fiable en prod multi-instances) |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app (utilisée pour les liens absolus, le sitemap, les liens WhatsApp) |

Aucune variable n'est nécessaire pour Stripe, Cloudinary ou l'envoi d'emails : ces services ne sont pas utilisés dans ce projet.

### Obtenir une chaîne de connexion MongoDB (Atlas, gratuit)

1. Créez un compte sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (M0)
3. Dans "Database Access", créez un utilisateur avec mot de passe
4. Dans "Network Access", autorisez votre IP (ou `0.0.0.0/0` pour autoriser depuis n'importe où — pratique en développement, à restreindre en production)
5. Cliquez sur "Connect" → "Drivers" → copiez la chaîne `mongodb+srv://...` et ajoutez `/semevoshop` après le nom d'hôte pour préciser le nom de la base

## Comptes de test (après `npm run prisma:seed`)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@semevoshop.com` | `Admin1234` |
| Client | `client@semevoshop.com` | `Client1234` |

Code promo de test : `BIENVENUE10` (-10 %, achat minimum 5 000 FCFA).

**Pensez à changer ces mots de passe avant toute mise en production.**

## Configuration WhatsApp

Le numéro WhatsApp utilisé pour le bouton de contact flottant, la page "mot de passe oublié" et les confirmations de commande est configurable depuis **Admin → Paramètres → Général → Numéro WhatsApp** (format international, chiffres uniquement, ex : `22966623182`). Une valeur par défaut est définie dans le code (`lib/whatsapp.ts`) tant que les paramètres boutique n'ont pas été configurés en base.

## Scripts disponibles

```bash
npm run dev             # démarrage en développement
npm run build            # build de production
npm run start             # démarrage en production (après build)
npm run lint               # ESLint
npm run typecheck           # vérification TypeScript
npm run prisma:generate      # régénère le client Prisma après modification du schéma
npm run prisma:push           # applique le schéma à la base MongoDB (pas de migrations)
npm run prisma:studio          # interface graphique pour explorer la base
npm run prisma:seed             # (ré)injecte les données de démonstration
```

## Déploiement

### 1. Base de données
Suivez la section MongoDB Atlas ci-dessus. Notez la chaîne de connexion.

### 2. Hébergement de l'application (Vercel recommandé)
1. Poussez le dépôt sur GitHub
2. Sur [vercel.com](https://vercel.com), importez le dépôt
3. Renseignez toutes les variables d'environnement de `.env.example` dans les réglages du projet Vercel
4. Déployez

### 3. Initialiser la base en production
Depuis votre machine, avec `DATABASE_URL` pointant vers la base de production :
```bash
DATABASE_URL="votre-chaine-de-production" npx prisma db push
DATABASE_URL="votre-chaine-de-production" npm run prisma:seed   # optionnel, données de démo
```

### 4. Nom de domaine
Ajoutez votre domaine dans les réglages Vercel, puis mettez à jour `NEXT_PUBLIC_APP_URL` et `NEXTAUTH_URL` avec l'URL finale.

## Structure du projet

```
app/
  (auth)/            pages de connexion/inscription (layout dédié)
  (shop)/             site public + espace client (layout partagé avec header/footer)
    account/           espace client
  admin/                espace admin (layout dédié)
  api/                   routes API (auth, compte, admin, panier, commandes, média...)
components/
  ui/                   primitives shadcn (bouton, input, dialog...)
  site/                  composants du site public
  account/                composants de l'espace client
  admin/                   composants de l'espace admin
  product/, cart/, checkout/, shared/   composants transverses
lib/                       logique métier (auth, tarification, factures, upload média...)
prisma/
  schema.prisma             schéma de la base de données
  seed.ts                    script de données de démonstration
store/                        état client (panier, Zustand)
types/                         types TypeScript globaux
public/images/                  visuels placeholder utilisés par le seed
```

## Notes techniques importantes

- **MongoDB via Prisma** : le schéma utilise des identifiants `cuid()` classiques (pas d'`ObjectId` natif Mongo), ce qui simplifie les références et évite les contraintes de format d'ID. Les migrations SQL n'existent pas avec Mongo : `npx prisma db push` synchronise le schéma directement.
- **Paiement à la livraison** : une commande est confirmée immédiatement à la validation du panier (pas d'attente de paiement en ligne), le stock est décrémenté à ce moment-là. Le statut de paiement (`paymentStatus`) reste `PENDING` jusqu'à ce que l'admin la marque payée (généralement en la passant au statut "Livrée").
- **Suppression de compte** : bloquée si le client a un historique de commandes (pour ne pas casser les factures existantes) — l'admin doit alors fermer le compte manuellement après contact WhatsApp.
- **Images** : compressées et redimensionnées automatiquement (max 1600px, JPEG qualité 80) avant stockage en base pour limiter la taille des documents MongoDB.

## Limitations connues

- Pas de mode "commande invité" : une commande nécessite un compte (le carnet d'adresses est lié à l'utilisateur).
- Le rate limiting utilise un stockage en mémoire si Upstash Redis n'est pas configuré — insuffisant pour un déploiement multi-instances (configurez Upstash en production).
