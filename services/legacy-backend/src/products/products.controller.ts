import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import {
  CreateMerchantProductRegistryDto,
  UpdateMerchantProductRegistryDto,
} from './dto/merchant-product-registry.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listProducts(@Query('category') category?: string, @Query('search') search?: string, @Query('approved') approved?: string) {
    return this.productsService.listProducts({ category, search, approved });
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('search')
  searchProducts(@Query('q') q?: string, @Query('category') category?: string) {
    return this.productsService.listProducts({ category, search: q, approved: 'true' });
  }

  @Get('eligibility/:passId')
  getEligibleProducts(@Param('passId') passId: string) {
    return this.productsService.getEligibleProducts(Number(passId));
  }

  @Get('registry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MERCHANT, UserRole.SPONSOR)
  listMerchantRegistry(@Query('merchantId') merchantId?: string) {
    return this.productsService.listMerchantRegistry(merchantId ? Number(merchantId) : undefined);
  }

  @Get('accessible/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SPONSOR, UserRole.BENEFICIARY)
  getUserAccessibleRegistry(@Param('userId') userId: string, @Query('passId') passId?: string) {
    return this.productsService.getUserAccessibleRegistry(Number(userId), passId ? Number(passId) : undefined);
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getProductById(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Post('registry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MERCHANT)
  createMerchantRegistry(@Body() dto: CreateMerchantProductRegistryDto) {
    return this.productsService.createMerchantRegistry(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(Number(id), dto);
  }

  @Put('registry/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MERCHANT)
  updateMerchantRegistry(@Param('id') id: string, @Body() dto: UpdateMerchantProductRegistryDto) {
    return this.productsService.updateMerchantRegistry(Number(id), dto);
  }
}
