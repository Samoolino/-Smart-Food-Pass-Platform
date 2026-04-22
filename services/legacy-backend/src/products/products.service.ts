import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pass } from '../passes/entities/pass.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Pass)
    private readonly passRepository: Repository<Pass>,
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
}
