import type { VictualsProduct } from '../../../packages/shared-types/src/product';

export interface ProductSourceAdapter {
  sourceName: string;
  fetchByName(name: string): Promise<unknown[]>;
  fetchByBarcode(barcode: string): Promise<unknown | null>;
  normalizeProduct(sourceRecord: unknown): Promise<VictualsProduct>;
  scoreSourceConfidence(sourceRecord: unknown): number;
}
