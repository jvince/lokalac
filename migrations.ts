import type { Migration } from "./migrate.ts";

export default [
  [
    "local_communities",
    () => [
      {
        key: ["local_community", "aleksandrovo"],
        type: "set",
        value: {
          id: "aleksandrovo",
          name: "MZ Aleksandrovo",
          phone: ["024/566-070"],
          link: "https://subotica.ls.gov.rs/mz-aleksandrovo/",
        },
      },
      {
        key: ["local_community", "bajmok"],
        type: "set",
        value: {
          id: "bajmok",
          name: "MZ Bajmok",
          phone: ["024/762-038"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-bajmok/",
        },
      },
      {
        key: ["local_community", "bajnat"],
        type: "set",
        value: {
          id: "bajnat",
          name: "MZ Bajnat",
          phone: ["024/524-775"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-bajnat/",
        },
      },
      {
        key: ["local_community", "backi_vinogradi"],
        type: "set",
        value: {
          id: "backi_vinogradi",
          name: "MZ Bački Vinogradi",
          phone: ["024/4757-003"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-backi-vinogradi/",
        },
      },
      {
        key: ["local_community", "backo_dusanovo"],
        type: "set",
        value: {
          id: "backo_dusanovo",
          name: "MZ Bačko Dušanovo",
          phone: ["024/782-243"],
          link: "https://subotica.ls.gov.rs/mesne-zajednice/mz-bikovo/",
        },
      },
      {
        key: ["local_community", "bikovo"],
        type: "set",
        value: {
          id: "bikovo",
          name: "MZ Bikovo",
          phone: ["024/4797-049"],
          link: "https://subotica.ls.gov.rs/mesne-zajednice/mz-bikovo/",
        },
      },
      {
        key: ["local_community", "centar_i"],
        type: "set",
        value: {
          id: "centar_i",
          name: "MZ Centar I",
          phone: ["024/558-699"],
          link: "https://subotica.ls.gov.rs/mz-centar-i/",
        },
      },
      {
        key: ["local_community", "centar_ii"],
        type: "set",
        value: {
          id: "centar_ii",
          name: "MZ Centar II",
          phone: ["024/558-166"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-centar-ii/",
        },
      },
      {
        key: ["local_community", "centar_iii"],
        type: "set",
        value: {
          id: "centar_iii",
          name: "MZ Centar III",
          phone: ["024/556-141"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-centar-iii/",
        },
      },
      {
        key: ["local_community", "cantavir"],
        type: "set",
        value: {
          id: "cantavir",
          name: "MZ Čantavir",
          phone: ["024/782-294"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-cantavir/",
        },
      },
      {
        key: ["local_community", "dudova_suma"],
        type: "set",
        value: {
          id: "dudova_suma",
          name: "MZ Dudova šuma",
          phone: ["024/529-730"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-dudova-suma/",
        },
      },
      {
        key: ["local_community", "djurdjin"],
        type: "set",
        value: {
          id: "djurdjin",
          name: "MZ Đurđin",
          phone: ["024/4768-050"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-djurdjin/",
        },
      },
      {
        key: ["local_community", "gat"],
        type: "set",
        value: {
          id: "gat",
          name: "MZ Gat",
          phone: ["024/4562-570"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-gat/",
        },
      },
      {
        key: ["local_community", "hajdukovo"],
        type: "set",
        value: {
          id: "hajdukovo",
          name: "MZ Hajdukovo",
          phone: ["024/4758-021"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-hajdukovo/",
        },
      },
      {
        key: ["local_community", "kelebija"],
        type: "set",
        value: {
          id: "kelebija",
          name: "MZ Kelebija",
          phone: ["024/4780-205"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-kelebija/",
        },
      },
      {
        key: ["local_community", "ker"],
        type: "set",
        value: {
          id: "ker",
          name: "MZ Ker",
          phone: ["024/552-106"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-ker/",
        },
      },
      {
        key: ["local_community", "kertvaros"],
        type: "set",
        value: {
          id: "kertvaros",
          name: "MZ Kertvaroš",
          phone: ["024/546-484"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-kertvaros/",
        },
      },
      {
        key: ["local_community", "ljutovo"],
        type: "set",
        value: {
          id: "ljutovo",
          name: "MZ Ljutovo",
          phone: ["024/4767-552"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-ljutovo/",
        },
      },
      {
        key: ["local_community", "makova_sedmica"],
        type: "set",
        value: {
          id: "makova_sedmica",
          name: "MZ Makova sedmica",
          phone: ["024/550-015"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-makova-sedmica/",
        },
      },
      {
        key: ["local_community", "mala_bosna"],
        type: "set",
        value: {
          id: "mala_bosna",
          name: "MZ Mala Bosna",
          phone: ["024/4796-026"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-kancelarije/mz-mala-bosna/",
        },
      },
      {
        key: ["local_community", "mali_bajmok"],
        type: "set",
        value: {
          id: "mali_bajmok",
          name: "MZ Mali Bajmok",
          phone: ["024/561-661"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-mali-bajmok/",
        },
      },
      {
        key: ["local_community", "mali_radanovac"],
        type: "set",
        value: {
          id: "mali_radanovac",
          name: "MZ Mali Radanovac",
          phone: ["024/546-149"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-mali-radanovac/",
        },
      },
      {
        key: ["local_community", "misicevo"],
        type: "set",
        value: {
          id: "misicevo",
          name: "MZ Mišićevo",
          phone: ["024/4760-098"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-misicevo/",
        },
      },
      {
        key: ["local_community", "novi_grad"],
        type: "set",
        value: {
          id: "novi_grad",
          name: "MZ Novi grad",
          phone: ["024/547-551"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-novi-grad/",
        },
      },
      {
        key: ["local_community", "novi_zednik"],
        type: "set",
        value: {
          id: "novi_zednik",
          name: "MZ Novi Žednik",
          phone: ["024/785-009"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-novi-zednik/",
        },
      },
      {
        key: ["local_community", "novo_selo"],
        type: "set",
        value: {
          id: "novo_selo",
          name: "MZ Novo Selo",
          phone: ["024/556-796"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-novo-selo/",
        },
      },
      {
        key: ["local_community", "palic"],
        type: "set",
        value: {
          id: "palic",
          name: "MZ Palić",
          phone: ["024/754-037"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-palic/",
        },
      },
      {
        key: ["local_community", "pescara"],
        type: "set",
        value: {
          id: "pescara",
          name: "MZ Peščara",
          phone: ["024/516-124"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-pescara/",
        },
      },
      {
        key: ["local_community", "prozivka"],
        type: "set",
        value: {
          id: "prozivka",
          name: "MZ Prozivka",
          phone: ["024/524-807"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-prozivka/",
        },
      },
      {
        key: ["local_community", "radanovac"],
        type: "set",
        value: {
          id: "radanovac",
          name: "MZ Radanovac",
          phone: ["024/596-002"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-radanovac/",
        },
      },
      {
        key: ["local_community", "stari_zednik"],
        type: "set",
        value: {
          id: "stari_zednik",
          name: "MZ Stari Žednik",
          phone: ["024/787-040"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-stari-zednik/",
        },
      },
      {
        key: ["local_community", "supljak"],
        type: "set",
        value: {
          id: "supljak",
          name: "MZ Šupljak",
          phone: ["024/753-050"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-supljak/",
        },
      },
      {
        key: ["local_community", "tavankut"],
        type: "set",
        value: {
          id: "tavankut",
          name: "MZ Tavankut",
          phone: ["024/4767-006"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-tavankut/",
        },
      },
      {
        key: ["local_community", "verusic"],
        type: "set",
        value: {
          id: "verusic",
          name: "MZ Verušić",
          phone: ["024/552-723", "024/552-701"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-verusic/",
        },
      },
      {
        key: ["local_community", "visnjevac"],
        type: "set",
        value: {
          id: "visnjevac",
          name: "MZ Višnjevac",
          phone: ["024/4782-040"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-visnjevac/",
        },
      },
      {
        key: ["local_community", "zorka"],
        type: "set",
        value: {
          id: "zorka",
          name: "MZ Zorka",
          phone: ["024/527-491"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-zorka/",
        },
      },
      {
        key: ["local_community", "zeleznicko_naselje"],
        type: "set",
        value: {
          id: "zeleznicko_naselje",
          name: "MZ Železničko naselje",
          phone: ["024/576-795"],
          link:
            "https://subotica.ls.gov.rs/lokalna-samouprava/mesne-zajednice/mz-zeljeznicko-naselje/",
        },
      },
    ],
  ],
  [
    "issue_categories",
    () => [
      {
        key: ["issue_category", "infrastructure_public_works"],
        type: "set",
        value: {
          id: "infrastructure_public_works",
          name: "Infrastructure and Public Works",
          description: "Infrastructure and Public Works",
        },
      },
      {
        key: ["issue_category", "environmental_concerns"],
        type: "set",
        value: {
          id: "environmental_concerns",
          name: "Environmental Concerns",
          description: "Environmental Concerns",
        },
      },
      {
        key: ["issue_category", "public_safety"],
        type: "set",
        value: {
          id: "public_safety",
          name: "Public Safety",
          description: "Public Safety",
        },
      },
      {
        key: ["issue_category", "city_services"],
        type: "set",
        value: {
          id: "city_services",
          name: "City Services",
          description: "City Services",
        },
      },
      {
        key: ["issue_category", "other"],
        type: "set",
        value: {
          id: "other",
          name: "Other",
          description: "Other",
        },
      },
    ],
  ],
  [
    "infrastructure_public_works_issues",
    () => [
      {
        key: ["issue_type", "potholes"],
        type: "set",
        value: {
          id: "potholes",
          category: "infrastructure_public_works",
          name: "Potholes",
          description: "Potholes on the road",
        },
      },
      {
        key: ["issue_type", "road_damage"],
        type: "set",
        value: {
          id: "road_damage",
          category: "infrastructure_public_works",
          name: "Road Damage",
          description: "Damage to the road surface",
        },
      },
      {
        key: ["issue_type", "road_signs"],
        type: "set",
        value: {
          id: "road_signs",
          category: "infrastructure_public_works",
          name: "Road Signs",
          description: "Missing or damaged road signs",
        },
      },
      {
        key: ["issue_type", "street_lights"],
        type: "set",
        value: {
          id: "street_lights",
          category: "infrastructure_public_works",
          name: "Street Lights",
          description: "Broken or non-functional street lights",
        },
      },
      {
        key: ["issue_type", "sidewalks"],
        type: "set",
        value: {
          id: "sidewalks",
          category: "infrastructure_public_works",
          name: "Sidewalks",
          description: "Damaged or obstructed sidewalks",
        },
      },
    ],
  ],
  [
    "environmental_concerns_issues",
    () => [
      {
        key: ["issue_type", "littering"],
        type: "set",
        value: {
          id: "littering",
          category: "environmental_concerns",
          name: "Littering",
          description: "Littering in public spaces",
        },
      },
      {
        key: ["issue_type", "illegal_dumping"],
        type: "set",
        value: {
          id: "illegal_dumping",
          category: "environmental_concerns",
          name: "Illegal Dumping",
          description: "Illegal dumping of waste",
        },
      },
      {
        key: ["issue_type", "water_quality"],
        type: "set",
        value: {
          id: "water_quality",
          category: "environmental_concerns",
          name: "Water Quality",
          description: "Concerns about water quality (contamination, etc.)",
        },
      },
      {
        key: ["issue_type", "air_quality"],
        type: "set",
        value: {
          id: "air_quality",
          category: "environmental_concerns",
          name: "Air Quality",
          description: "Concerns about air quality (pollution, etc.)",
        },
      },
      {
        key: ["issue_type", "noise_pollution"],
        type: "set",
        value: {
          id: "noise_pollution",
          category: "environmental_concerns",
          name: "Noise Pollution",
          description: "Noise pollution in the area",
        },
      },
      {
        key: ["issue_type", "green_spaces"],
        type: "set",
        value: {
          id: "green_spaces",
          category: "environmental_concerns",
          name: "Green Spaces",
          description: "Issues with green spaces (maintenance, etc.)",
        },
      },
    ],
  ],
  [
    "public_safety_issues",
    () => [
      {
        key: ["issue_type", "crime"],
        type: "set",
        value: {
          id: "crime",
          category: "public_safety",
          name: "Crime",
          description: "Crime in the area",
        },
      },
      {
        key: ["issue_type", "vandalism"],
        type: "set",
        value: {
          id: "vandalism",
          category: "public_safety",
          name: "Vandalism",
          description: "Vandalism in public spaces",
        },
      },
    ],
  ],
  [
    "city_services_issues",
    () => [
      {
        key: ["issue_type", "waste_collection"],
        type: "set",
        value: {
          id: "waste_collection",
          category: "city_services",
          name: "Waste Collection",
          description: "Issues with waste collection (missed pickups, etc.)",
        },
      },
      {
        key: ["issue_type", "water_supply"],
        type: "set",
        value: {
          id: "water_supply",
          category: "city_services",
          name: "Water Supply",
          description:
            "Issues with water supply (low pressure, contamination, etc.)",
        },
      },
      {
        key: ["issue_type", "sewerage"],
        type: "set",
        value: {
          id: "sewerage",
          category: "city_services",
          name: "Sewerage",
          description: "Issues with sewerage (blockages, leaks, etc.)",
        },
      },
      {
        key: ["issue_type", "public_transport"],
        type: "set",
        value: {
          id: "public_transport",
          category: "city_services",
          name: "Public Transport",
          description:
            "Issues with public transport (delays, route changes, etc.)",
        },
      },
    ],
  ],
  [
    "other_issues",
    () => [
      {
        key: ["issue_type", "community_event_suggestion"],
        type: "set",
        value: {
          id: "community_event_suggestion",
          category: "other",
          name: "Community Event Suggestion",
          description: "Suggestions for community events or activities",
        },
      },
      {
        key: ["issue_type", "feedback"],
        type: "set",
        value: {
          id: "feedback",
          category: "other",
          name: "Feedback",
          description: "General feedback or suggestions",
        },
      },
      {
        key: ["issue_type", "other"],
        type: "set",
        value: {
          id: "other",
          category: "other",
          name: "Other",
          description: "Other issues not covered by the above categories",
        },
      },
    ],
  ],
] as Migration[];
