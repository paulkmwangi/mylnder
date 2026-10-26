import type { SavedUser } from "../types/admin.types";

// Demo records live in one file. Replace these URLs/data later with database results.
// Each user contains the COMPLETE image list; cards show only the first three previews.
const photoSets = {
  amsterdam: [
    "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85"
  ],
  copenhagen: [
    "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=85"
  ],
  barcelona: [
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85"
  ],
  italy: [
    "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&w=900&q=85"
  ]
};

const records: Omit<SavedUser, "images" | "isPosted">[] = [
  { id: "emma-rossi", name: "Emma Rossi", university: "University of Amsterdam", major: "Computer Science", instagram: "@emma.rossi" },
  { id: "lukas-jensen", name: "Lukas Jensen", university: "University of Copenhagen", major: "Data Science", instagram: "@lukas.jensen" },
  { id: "sofia-martinez", name: "Sofia Martínez", university: "University of Barcelona", major: "Biotechnology", instagram: "@sofia.martinez" },
  { id: "eero-laine", name: "Eero Laine", university: "University of Helsinki", major: "Mechanical Engineering", instagram: "@eero.laine" },
  { id: "charlotte-muller", name: "Charlotte Müller", university: "University of Edinburgh", major: "Psychology", instagram: "@charlotte.mueller" },
  { id: "matteo-bianchi", name: "Matteo Bianchi", university: "University of Bologna", major: "Engineering", instagram: "@matteo.bianchi" },
  { id: "katharina-weber", name: "Katharina Weber", university: "University of Vienna", major: "International Relations", instagram: "@kathi.weber" },
  { id: "tiago-silva", name: "Tiago Silva", university: "University of Lisbon", major: "Economics", instagram: "@tiago.silva" },
  { id: "agnieszka-nowak", name: "Agnieszka Nowak", university: "University of Warsaw", major: "Law", instagram: "@agnieszka.nowak" },
  { id: "jan-novak", name: "Jan Novák", university: "Charles University", major: "Computer Science", instagram: "@jan.novak" },
  { id: "camille-dubois", name: "Camille Dubois", university: "Sorbonne University", major: "Literature", instagram: "@camille.dubois" },
  { id: "felix-wagner", name: "Felix Wagner", university: "Heidelberg University", major: "Medicine", instagram: "@felix.wagner" },
  { id: "ines-santos", name: "Inês Santos", university: "University of Porto", major: "Architecture", instagram: "@ines.santos" },
  { id: "oliver-brown", name: "Oliver Brown", university: "University of Oxford", major: "Economics", instagram: "@oliver.brown" },
  { id: "freja-nielsen", name: "Freja Nielsen", university: "Aarhus University", major: "Design", instagram: "@freja.nielsen" },
  { id: "elena-kovac", name: "Elena Kovač", university: "University of Ljubljana", major: "Biology", instagram: "@elena.kovac" },
  { id: "noah-schmidt", name: "Noah Schmidt", university: "University of Zurich", major: "Physics", instagram: "@noah.schmidt" },
  { id: "amelie-laurent", name: "Amélie Laurent", university: "University of Paris", major: "Art History", instagram: "@amelie.laurent" },
  { id: "milan-petrov", name: "Milan Petrov", university: "University of Belgrade", major: "Mathematics", instagram: "@milan.petrov" },
  { id: "lucia-romano", name: "Lucia Romano", university: "Sapienza University of Rome", major: "Medicine", instagram: "@lucia.romano" },
  { id: "alex-meyer", name: "Alex Meyer", university: "University of Hamburg", major: "Marketing", instagram: "@alex.meyer" },
  { id: "isabel-garcia", name: "Isabel García", university: "Complutense University", major: "Journalism", instagram: "@isabel.garcia" },
  { id: "erik-andersson", name: "Erik Andersson", university: "Uppsala University", major: "Environmental Science", instagram: "@erik.andersson" },
  { id: "nina-keller", name: "Nina Keller", university: "University of Basel", major: "Chemistry", instagram: "@nina.keller" }
];

const sets = [photoSets.amsterdam, photoSets.copenhagen, photoSets.barcelona, photoSets.italy];

export const mockUsers: SavedUser[] = records.map((user, index) => ({
  ...user,
  isPosted: false,
  images: [...sets[index % sets.length]]
}));