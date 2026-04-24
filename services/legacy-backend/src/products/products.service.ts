import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Pass } from '../passes/entities/pass.entity';
import { UserPlan } from '../payments/entities/user-plan.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import {
  CreateMerchantProductRegistryDto,
  UpdateMerchantProductRegistryDto,
} from './dto/merchant-product-registry.dto';
import { MerchantProductRegistry } from './entities/merchant-product-registry.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Pass)
    private readonly passRepository: Repository<Pass>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(MerchantProductRegistry)
    private readonly merchantProductRegistryRepository: Repository<MerchantProductRegistry>,
    @InjectRepository(UserPlan)
    private readonly userPlanRepository: Repository<UserPlan>,
  ) {}

  async listProducts(query?: { category?: string; search?: string; approved?: string }) {
    const qb = this.productRepository.createQueryBuilder('product');

    if (query?.category) {
      qb.andWhere('product.category = :category', { category: query.category });
    }

    if (query?.search) {
      qb.andWhere('(LOWER(product.productName) LIKE :search OR LOWER(product.brand) LIKE :search)', {
        search: `%${query.search.toLowerCase()}%`,
      });
    }

    if (query?.approved !== undefined) {
      qb.andWhere('product.isApproved = :approved', {
        approved: query.approved === 'true',
      });
    }

    qb.orderBy('product.createdAt', 'DESC');
    return qb.getMany();
  }

  async getCategories() {
    const rows = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL')
      .orderBy('product.category', 'ASC')
      .getRawMany();

    return rows.map((row) => row.category).filter(Boolean);
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const product = this.productRepository.create({
      ...dto,
      nutritionJson: dto.nutritionJson || {},
      isApproved: dto.isApproved ?? true,
    });

    return this.productRepository.save(product);
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const product = await this.getProductById(id);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async getEligibleProducts(passId: number) {
    const pass = await this.passRepository.findOne({ where: { id: passId } });
    if (!pass) {
      throw new NotFoundException('Pass not found');
    }

    if (!pass.productRestrictions?.length) {
      return this.productRepository.find({ where: { isApproved: true } });
    }

    return this.productRepository.find({
      where: {
        id: In(pass.productRestrictions),
        isApproved: true,
      },
    });
  }

  async createMerchantRegistry(dto: CreateMerchantProductRegistryDto) {
    const [merchant, product] = await Promise.all([
      this.merchantRepository.findOne({ where: { id: dto.merchantId } }),
      this.productRepository.findOne({ where: { id: dto.productId } }),
    ]);

    if (!merchant) throw new NotFoundException('Merchant not found');
    if (!product) throw new NotFoundException('Product not found');

    const record = this.merchantProductRegistryRepository.create({
      merchantId: dto.merchantId,
      productId: dto.productId,
      price: dto.price,
      inventoryQty: dto.inventoryQty ?? 0,
      merchantWalletAddress: dto.merchantWalletAddress || merchant.walletAddress || null,
      productOwnerWalletAddress: dto.productOwnerWalletAddress || product.ownerWalletAddress || null,
      paymentProvider: dto.paymentProvider || null,
      metadata: dto.metadata || {},
      isActive: true,
    });

    return this.merchantProductRegistryRepository.save(record);
  }

  async updateMerchantRegistry(id: number, dto: UpdateMerchantProductRegistryDto) {
    const record = await this.merchantProductRegistryRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Merchant product registry record not found');
    Object.assign(record, dto);
    return this.merchantProductRegistryRepository.save(record);
  }

  async listMerchantRegistry(merchantId?: number) {
    const qb = this.merchantProductRegistryRepository.createQueryBuilder('registry');
    if (merchantId) {
      qb.andWhere('registry.merchantId = :merchantId', { merchantId });
    }
    qb.orderBy('registry.createdAt', 'DESC');
    return qb.getMany();
  }

  async getUserAccessibleRegistry(userId: number, passId?: number) {
    const plans = await this.userPlanRepository.find({ where: { userId } });
    const registries = await this.merchantProductRegistryRepository.find({ where: { isActive: true } });
    const products = await this.productRepository.find();
    const productMap = new Map(products.map((p) => [p.id, p]));

    let allowedProductIds: number[] | null = null;
    if (passId) {
      const pass = await this.passRepository.findOne({ where: { id: passId } });
      if (!pass) throw new NotFoundException('Pass not found');
      allowedProductIds = pass.productRestrictions?.length ? pass.productRestrictions : null;
    }

    const planCategories = new Set<string>();
    plans.forEach((plan) => {
      const categories = (plan.accessRules?.categories as string[] | undefined) || [];
      categories.forEach((category) => planCategories.add(category));
    });

    const accessible = registries.filter((registry) => {
      const product = productMap.get(registry.productId);
      if (!product || !product.isApproved) return false;
      if (allowedProductIds && !allowedProductIds.includes(product.id)) return false;
      if (planCategories.size && product.category && !planCategories.has(product.category)) return false;
      return true;
    });

    return {
      plans,
      accessible,
      guidance: {
        nutritionSupplyChain: 'Use active user plans, approved product categories, and pass-linked restrictions to guide smart stamp access and fulfillment routing.',
        walletPathways: accessible.map((registry) => ({
          merchantId: registry.merchantId,
          productId: registry.productId,
          merchantWalletAddress: registry.merchantWalletAddress || null,
          productOwnerWalletAddress: registry.productOwnerWalletAddress || null,
        })),
      },
    };
  }
}
