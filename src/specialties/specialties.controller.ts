import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { AuthGuard } from '@/common/guards/auth.guard';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtiesService.create(createSpecialtyDto);
  }

  @Post('addAll-specialities')
  @UseGuards(AuthGuard)
  createAll(@Body() CreateSpecialtyDtos: CreateSpecialtyDto[]) {
    return this.specialtiesService.createAll(CreateSpecialtyDtos);
  }

  @Get()
  findAll() {
    return this.specialtiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specialtiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(+id, updateSpecialtyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specialtiesService.removeById(+id);
  }
}
