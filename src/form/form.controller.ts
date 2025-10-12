import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadInterceptor } from 'src/common/interseptors/file-upload.interceptor';

@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('send')
  @UseInterceptors(
    FileUploadInterceptor('files', {
      maxFiles: 3,
      maxFileSize: 5 * 1024 * 1024, // 5 МБ
      allowedTypes: /jpeg|jpg|png/,
      useMemoryStorage: false, // файли не зберігаються на диск
    }),
  )
  create(@Body() createFormDto: CreateFormDto, @UploadedFiles() files: any[]) {
    return this.formService.create(createFormDto, files);
  }

  @Get()
  findAll() {
    return this.formService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formService.update(+id, updateFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formService.remove(+id);
  }
}
