import { createCommunityMigration } from "@/import/communities/migrate.ts";
import type { Migration } from "@/migrate.ts";
import { IssueCategoryIndex } from "@/models/issue-category.ts";
import { IssueTypeIndex } from "@/models/issue-type.ts";

export default [
  [
    "issue_categories",
    () => [
      {
        key: [IssueCategoryIndex, "infrastructure_public_works"],
        type: "set",
        value: {
          id: "infrastructure_public_works",
          name: "Infrastruktura i javni radovi",
          name_sr_Cyrl_RS: "Инфраструктура и јавни радови",
          name_hu: "Infrastruktúra és közmunkák",
          description: "Infrastructure and Public Works",
        },
      },
      {
        key: [IssueCategoryIndex, "environmental_concerns"],
        type: "set",
        value: {
          id: "environmental_concerns",
          name: "Ekološki problemi",
          name_sr_Cyrl_RS: "Еколошки проблеми",
          name_hu: "Környezetvédelmi problémák",
          description: "Environmental Concerns",
        },
      },
      {
        key: [IssueCategoryIndex, "public_safety"],
        type: "set",
        value: {
          id: "public_safety",
          name: "Javna bezbednost",
          name_sr_Cyrl_RS: "Јавна безбедност",
          name_hu: "Közbiztonság",
          description: "Public Safety",
        },
      },
      {
        key: [IssueCategoryIndex, "city_services"],
        type: "set",
        value: {
          id: "city_services",
          name: "Gradske usluge",
          name_sr_Cyrl_RS: "Градске услуге",
          name_hu: "Városi szolgáltatások",
          description: "City Services",
        },
      },
      {
        key: [IssueCategoryIndex, "other"],
        type: "set",
        value: {
          id: "other",
          name: "Ostalo",
          name_sr_Cyrl_RS: "Остало",
          name_hu: "Egyéb",
          description: "Other",
        },
      },
    ],
  ],
  [
    "infrastructure_public_works_issues",
    () => [
      {
        key: [IssueTypeIndex, "potholes"],
        type: "set",
        value: {
          id: "potholes",
          category: "infrastructure_public_works",
          name: "Rupe na putu",
          name_sr_Cyrl_RS: "Рупе на путу",
          name_hu: "Kátyúk az úton",
          description: "Potholes on the road",
        },
      },
      {
        key: [IssueTypeIndex, "road_damage"],
        type: "set",
        value: {
          id: "road_damage",
          category: "infrastructure_public_works",
          name: "Šteta na putu",
          name_sr_Cyrl_RS: "Штета на путу",
          name_hu: "Út károsodása",
          description: "Damage to the road surface",
        },
      },
      {
        key: [IssueTypeIndex, "road_signs"],
        type: "set",
        value: {
          id: "road_signs",
          category: "infrastructure_public_works",
          name: "Saobraćajni znakovi",
          name_sr_Cyrl_RS: "Саобраћајни знакови",
          name_hu: "Közlekedési táblák",
          description: "Missing or damaged road signs",
        },
      },
      {
        key: [IssueTypeIndex, "street_lights"],
        type: "set",
        value: {
          id: "street_lights",
          category: "infrastructure_public_works",
          name: "Ulična rasveta",
          name_sr_Cyrl_RS: "Улична расвета",
          name_hu: "Utcai világítás",
          description: "Broken or non-functional street lights",
        },
      },
      {
        key: [IssueTypeIndex, "sidewalks"],
        type: "set",
        value: {
          id: "sidewalks",
          category: "infrastructure_public_works",
          name: "Trotoari",
          name_sr_Cyrl_RS: "Trotoari",
          name_hu: "Járdák",
          description: "Damaged or obstructed sidewalks",
        },
      },
    ],
  ],
  [
    "environmental_concerns_issues",
    () => [
      {
        key: [IssueTypeIndex, "littering"],
        type: "set",
        value: {
          id: "littering",
          category: "environmental_concerns",
          name: "Semeće na javnim mestima",
          name_sr_Cyrl_RS: "Смеће на јавним местима",
          name_hu: "Szemét a közterületeken",
          description: "Littering in public spaces",
        },
      },
      {
        key: [IssueTypeIndex, "illegal_dumping"],
        type: "set",
        value: {
          id: "illegal_dumping",
          category: "environmental_concerns",
          name: "Nedozvoljeno odlaganje otpada",
          name_sr_Cyrl_RS: "Нелегално одлагање отпада",
          name_hu: "Illegális hulladéklerakás",
        },
      },
      {
        key: [IssueTypeIndex, "water_quality"],
        type: "set",
        value: {
          id: "water_quality",
          category: "environmental_concerns",
          name: "Kvalitet vode",
          name_sr_Cyrl_RS: "Квалитет воде",
          name_hu: "Vízminőség",
          description: "Concerns about water quality (contamination, etc.)",
        },
      },
      {
        key: [IssueTypeIndex, "air_quality"],
        type: "set",
        value: {
          id: "air_quality",
          category: "environmental_concerns",
          name: "Kvalitet vazduha",
          name_sr_Cyrl_RS: "Квалитет ваздуха",
          name_hu: "Levegőminőség",
          description: "Concerns about air quality (pollution, etc.)",
        },
      },
      {
        key: [IssueTypeIndex, "noise_pollution"],
        type: "set",
        value: {
          id: "noise_pollution",
          category: "environmental_concerns",
          name: "Zagađenje bukom",
          name_sr_Cyrl_RS: "Загађење буком",
          name_hu: "Zajárási szennyezés",
          description: "Noise pollution in the area",
        },
      },
      {
        key: [IssueTypeIndex, "green_spaces"],
        type: "set",
        value: {
          id: "green_spaces",
          category: "environmental_concerns",
          name: "Zelene površine",
          name_sr_Cyrl_RS: "Зеленe површине",
          name_hu: "Zöld területek",
          description: "Issues with green spaces (maintenance, etc.)",
        },
      },
    ],
  ],
  [
    "public_safety_issues",
    () => [
      {
        key: [IssueTypeIndex, "crime"],
        type: "set",
        value: {
          id: "crime",
          category: "public_safety",
          name: "Kriminal",
          name_sr_Cyrl_RS: "Криминал",
          name_hu: "Bűnözés",
          description: "Crime in the area",
        },
      },
      {
        key: [IssueTypeIndex, "vandalism"],
        type: "set",
        value: {
          id: "vandalism",
          category: "public_safety",
          name: "Vandalizam",
          name_sr_Cyrl_RS: "Вандализам",
          name_hu: "Vandalizmus",
          description: "Vandalism in public spaces",
        },
      },
    ],
  ],
  [
    "city_services_issues",
    () => [
      {
        key: [IssueTypeIndex, "waste_collection"],
        type: "set",
        value: {
          id: "waste_collection",
          category: "city_services",
          name: "Odnošenje smeća",
          name_sr_Cyrl_RS: "Одношење смећа",
          name_hu: "Hulladékgyűjtés",
          description: "Issues with waste collection (missed pickups, etc.)",
        },
      },
      {
        key: [IssueTypeIndex, "water_supply"],
        type: "set",
        value: {
          id: "water_supply",
          category: "city_services",
          name: "Vodosnabdevanje",
          name_sr_Cyrl_RS: "Водоснабдевање",
          name_hu: "Vízellátás",
          description:
            "Issues with water supply (low pressure, contamination, etc.)",
        },
      },
      {
        key: [IssueTypeIndex, "sewerage"],
        type: "set",
        value: {
          id: "sewerage",
          category: "city_services",
          name: "Kanalizacija",
          name_sr_Cyrl_RS: "Канализација",
          name_hu: "Csatornázás",
          description: "Issues with sewerage (blockages, leaks, etc.)",
        },
      },
      {
        key: [IssueTypeIndex, "public_transport"],
        type: "set",
        value: {
          id: "public_transport",
          category: "city_services",
          name: "Javni prevoz",
          name_sr_Cyrl_RS: "Јавни превоз",
          name_hu: "Tömegközlekedés",
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
        key: [IssueTypeIndex, "community_event_suggestion"],
        type: "set",
        value: {
          id: "community_event_suggestion",
          category: "other",
          name: "Predlog za zajednički događaj",
          name_sr_Cyrl_RS: "Предлог за заједнички догађај",
          name_hu: "Közösségi esemény javaslat",
          description: "Suggestions for community events or activities",
        },
      },
      {
        key: [IssueTypeIndex, "feedback"],
        type: "set",
        value: {
          id: "feedback",
          category: "other",
          name: "Povratne informacije",
          name_sr_Cyrl_RS: "Повратнe информацијe",
          name_hu: "Visszajelzés",
          description: "General feedback or suggestions",
        },
      },
      {
        key: [IssueTypeIndex, "other"],
        type: "set",
        value: {
          id: "other",
          category: "other",
          name: "Ostalo",
          name_sr_Cyrl_RS: "Остало",
          name_hu: "Egyéb",
          description: "Other issues not covered by the above categories",
        },
      },
    ],
  ],
  [
    "local_communities",
    async () => await createCommunityMigration(),
  ],
] as Migration[];
