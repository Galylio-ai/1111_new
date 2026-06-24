import { LegalShell, LegalSection } from "@/components/site/LegalShell";

export const metadata = { title: "Conditions d'utilisation — 1111.tn" };

export default function ConditionsUtilisationPage() {
  return (
    <LegalShell
      title="Conditions d'utilisation"
      arabic="شروط الاستخدام"
      updated="24 juin 2026"
      intro="Les présentes conditions générales d'utilisation (« CGU ») régissent l'accès et l'utilisation du site 1111.tn. En naviguant sur le site, vous acceptez sans réserve ces conditions."
    >
      <LegalSection n={1} title="Objet">
        <p>
          1111.tn est un service de comparaison et de veille des prix qui agrège des informations
          produits et tarifaires provenant de sites e-commerce et d'enseignes tunisiennes. Le service
          a pour but d'aider les utilisateurs à comparer les prix, détecter les vraies promotions et
          réaliser des économies.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Acceptation des conditions">
        <p>
          L'utilisation du site implique l'acceptation pleine et entière des présentes CGU. Si vous
          n'acceptez pas ces conditions, vous devez cesser d'utiliser le site. 1111.tn se réserve le
          droit de modifier les CGU à tout moment ; la version applicable est celle en vigueur lors de
          votre visite.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Compte utilisateur">
        <p>
          Certaines fonctionnalités (favoris, alertes de prix, notifications) nécessitent la création
          d'un compte. Vous vous engagez à fournir des informations exactes et à préserver la
          confidentialité de vos identifiants. Vous êtes responsable de toute activité effectuée
          depuis votre compte.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Utilisation du service">
        <p>Vous vous engagez à utiliser le site conformément à la loi et à ne pas :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>extraire massivement les données du site par des moyens automatisés sans autorisation ;</li>
          <li>perturber le fonctionnement du service ou tenter d'y accéder de manière frauduleuse ;</li>
          <li>reproduire, revendre ou exploiter commercialement le contenu sans accord préalable.</li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="Prix et disponibilité">
        <p>
          Les prix affichés sont collectés automatiquement et fournis à titre indicatif. Malgré nos
          efforts de mise à jour, ils peuvent différer des prix réels constatés chez les marchands.
          1111.tn n'est pas vendeur des produits présentés et ne saurait être tenu responsable d'un
          écart de prix, d'une rupture de stock ou d'une erreur d'un marchand. Le prix faisant foi est
          toujours celui affiché sur le site du marchand au moment de l'achat.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Liens vers des sites tiers">
        <p>
          Le site contient des liens vers des sites de marchands tiers. 1111.tn n'exerce aucun
          contrôle sur ces sites et décline toute responsabilité quant à leur contenu, leurs produits
          ou leurs pratiques. Toute transaction se fait directement entre vous et le marchand.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Propriété intellectuelle">
        <p>
          La structure du site, son design, ses textes, logos et éléments graphiques sont la propriété
          de 1111.tn ou de ses partenaires et sont protégés par le droit de la propriété
          intellectuelle. Les marques et visuels des produits restent la propriété de leurs
          détenteurs respectifs.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Limitation de responsabilité">
        <p>
          Le service est fourni « en l'état ». 1111.tn ne garantit pas l'exactitude, l'exhaustivité ou
          la disponibilité continue des informations. L'utilisateur reste seul responsable des
          décisions d'achat qu'il prend sur la base des informations fournies.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Données personnelles">
        <p>
          Le traitement de vos données personnelles est décrit dans notre{" "}
          <a href="/confidentialite" className="font-semibold text-brand-gold hover:underline">
            Politique de confidentialité
          </a>
          , qui fait partie intégrante des présentes CGU.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Droit applicable et contact">
        <p>
          Les présentes CGU sont régies par le droit tunisien. Pour toute question relative à ces
          conditions, vous pouvez nous contacter à l'adresse{" "}
          <a href="mailto:contact@1111.tn" className="font-semibold text-brand-gold hover:underline">
            company@1111.tn
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
