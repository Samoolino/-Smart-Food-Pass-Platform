export type NutritionSource =
  | 'MYFOOD24'
  | 'OPEN_FOOD_FACTS'
  | 'USDA_FDC'
  | 'FAO_INFOODS'
  | 'GS1'
  | 'NAFDAC'
  | 'EDAMAM'
  | 'MERCHANT'
  | 'ADMIN_REVIEW';

export interface NutrientProfile {
  energyKcal?: number;
  proteinG?: number;
  carbohydrateG?: number;
  fatG?: number;
  fiberG?: number;
  sodiumMg?: number;
  ironMg?: number;
  calciumMg?: number;
  folateUg?: number;
  vitaminAMcg?: number;
}

export interface ProximateComposition {
  moisture?: number;
  ash?: number;
  crudeProtein?: number;
  crudeFat?: number;
  crudeFiber?: number;
  carbohydrate?: number;
}
