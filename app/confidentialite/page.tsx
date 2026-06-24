import { LegalShell, LegalSection } from "@/components/site/LegalShell";

export const metadata = { title: "Politique de confidentialité — 1111.tn" };

export default function ConfidentialitePage() {
  return (
    <LegalShell
      title="Politique de confidentialité"
      arabic="سياسة الخصوصية"
      updated="24 juin 2026"
      intro="La présente politique explique quelles données personnelles 1111.tn collecte, pourquoi, et quels sont vos droits. Nous nous engageons à protéger votre vie privée et à traiter vos données de manière transparente."
    >
      <LegalSection n={1} title="Données que nous collectons">
        <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Données de compte</strong> : nom, adresse e-mail, téléphone et gouvernorat (lors de l'inscription) ;</li>
          <li><strong>Données d'engagement</strong> : vos produits favoris et vos alertes de prix ;</li>
          <li><strong>Données techniques</strong> : informations de connexion et de navigation strictement nécessaires.</li>
        </ul>
      </LegalSection>

      <LegalSection n={2} title="Finalités du traitement">
        <p>Vos données sont utilisées pour :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>créer et gérer votre compte ;</li>
          <li>enregistrer vos favoris et vous envoyer des alertes lorsqu'un prix baisse ;</li>
          <li>vous adresser des notifications (dans l'application et par e-mail) que vous avez demandées ;</li>
          <li>améliorer et sécuriser le service.</li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Notifications et e-mails">
        <p>
          Si vous créez une alerte de prix, nous utilisons votre adresse e-mail pour vous prévenir
          lorsqu'un produit suivi baisse de prix. Vous pouvez supprimer une alerte à tout moment depuis
          votre profil pour cesser de recevoir ces e-mails.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Partage des données">
        <p>
          Nous ne vendons pas vos données personnelles. Elles ne sont partagées qu'avec des
          prestataires techniques strictement nécessaires au service (hébergement, envoi d'e-mails),
          tenus à la confidentialité, ou lorsque la loi l'exige.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Cookies">
        <p>
          1111.tn utilise un stockage local et des cookies essentiels pour vous garder connecté,
          mémoriser vos préférences (thème, panier du « Couffin ») et assurer la sécurité. Ces éléments
          sont nécessaires au fonctionnement du site. Vous pouvez les effacer via les réglages de votre
          navigateur, mais certaines fonctionnalités pourraient alors ne plus fonctionner.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Conservation des données">
        <p>
          Vos données sont conservées tant que votre compte est actif. Si vous supprimez votre compte,
          vos données personnelles, favoris et alertes sont supprimés, sauf obligation légale de
          conservation.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Sécurité">
        <p>
          Nous mettons en œuvre des mesures techniques appropriées (mots de passe chiffrés,
          authentification par jeton, connexions sécurisées) pour protéger vos données contre tout
          accès non autorisé.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Vos droits">
        <p>
          Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. La
          plupart de ces actions sont réalisables directement depuis votre profil. Pour toute demande
          complémentaire, contactez-nous à{" "}
          <a href="mailto:contact@1111.tn" className="font-semibold text-brand-gold hover:underline">
            contact@1111.tn
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n={9} title="Modifications">
        <p>
          Cette politique peut être mise à jour. Toute modification importante sera signalée sur le
          site. La date de dernière mise à jour figure en haut de cette page.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
