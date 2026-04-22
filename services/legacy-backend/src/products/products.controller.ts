import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
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

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(Number(id), dto);
  }
}
