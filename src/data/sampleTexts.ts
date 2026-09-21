export interface SampleText {
  id: string;
  title: string;
  category: string;
  text: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: "ai-revolution",
    title: "L'impact de l'IA générative dans les entreprises",
    category: "Technologie",
    text: `L'intelligence artificielle générative transforme en profondeur le paysage économique mondial. Selon une récente étude menée auprès de 500 grandes entreprises internationales, plus de 75 % des organisations ont déjà intégré des outils d'IA dans au moins un de leurs processus opérationnels, qu'il s'agisse du service client, de la rédaction de documentation technique ou de l'analyse prédictive de données de marché.

Cependant, cette adoption accélérée ne va pas sans poser d'importants défis éthiques et organisationnels. Le premier défi réside dans la gouvernance et la confidentialité des données sensibles : les entreprises doivent veiller à ce que leurs secrets industriels et les données personnelles de leurs utilisateurs ne soient pas absorbés par des modèles d'entraînement sans consentement préalable. 

Le second défi concerne l'évolution des compétences professionnelles. Plutôt que de remplacer purement et simplement les collaborateurs, les analystes s'accordent à dire que l'IA redéfinit les métiers : l'expertise humaine se déplace de l'exécution répétitive vers l'esprit critique, la formulation de requêtes précises (prompt engineering) et la validation rigoureuse des résultats générés. Les programmes de formation continue deviennent ainsi un impératif stratégique pour les départements de ressources humaines.

Enfin, l'impact énergétique des centres de calcul alimentant ces modèles à très grande échelle commence à faire l'objet de réglementations plus strictes en Europe et en Amérique du Nord, obligeant les géants de la technologie à investir massivement dans des sources d'énergie renouvelable et des architectures de puces électroniques plus efficientes.`
  },
  {
    id: "space-exploration",
    title: "La nouvelle course vers la Lune et Mars",
    category: "Science",
    text: `Plus de cinquante ans après les missions Apollo, l'exploration spatiale habitée connaît une renaissance sans précédent sous l'impulsion du programme international Artemis et de la montée en puissance d'acteurs privés innovants. L'objectif immédiat n'est plus seulement de poser le pied sur le sol lunaire pour une brève visite, mais d'établir une base permanente et autonome au pôle Sud de la Lune.

Cette région suscite toutes les convoitises en raison de la présence confirmée de glace d'eau au fond de cratères perpétuellement plongés dans l'ombre. Cette ressource est cruciale : une fois extraite et purifiée, l'eau peut non seulement abreuver les astronautes et alimenter les systèmes de survie, mais aussi être dissociée en hydrogène et oxygène pour fabriquer le carburant liquide nécessaire aux lanceurs spatiaux.

La Lune servira ainsi de banc d'essai et de tremplin technologique pour le véritable défi du XXIe siècle : le voyage habité vers Mars. Un aller-retour vers la planète rouge exige au minimum deux années et demie de voyage, exposant les équipages à des radiations cosmiques intenses, à une microgravité prolongée entraînant une perte de densité osseuse, et à un isolement psychologique total sans possibilité de ravitaillement d'urgence. Les avancées en propulsion thermique nucléaire et en systèmes de recyclage en boucle fermée seront déterminantes pour assurer la survie des futurs pionniers martiens.`
  },
  {
    id: "renewable-energy",
    title: "Transition énergétique : vers un stockage massif",
    category: "Écologie & Énergie",
    text: `Le déploiement des énergies solaire et éolienne a progressé à un rythme record au cours de la dernière décennie, réduisant considérablement le coût du mégawattheure renouvelable. Néanmoins, le talon d'Achille de ces énergies réside dans leur intermittence naturelle : le soleil ne brille pas la nuit et le vent ne souffle pas de façon continue aux moments exacts de pic de consommation industrielle et résidentielle.

Pour stabiliser les réseaux électriques modernes sans devoir recourir aux centrales thermiques à charbon ou au gaz, les ingénieurs se tournent vers une combinaison de technologies de stockage stationnaire. Si les batteries lithium-fer-phosphate (LFP) dominent aujourd'hui les installations à court terme (durée de 2 à 4 heures), de nouvelles alternatives émergent pour le stockage longue durée.

Parmi celles-ci figurent les batteries à flux redox à base de vanadium, capables de cycles quasi illimités sans dégradation, ainsi que les systèmes de stockage d'énergie thermique par sels fondus ou par gravité. Parallèlement, la production d'hydrogène vert par électrolyse de l'eau durant les périodes de surproduction solaire permet de conserver de l'énergie pour les mois d'hiver. Le succès de la transition énergétique dépendra donc moins de la capacité à installer de nouveaux panneaux solaires que de la rapidité à mailler le territoire en solutions de stockage intelligentes.`
  }
];
