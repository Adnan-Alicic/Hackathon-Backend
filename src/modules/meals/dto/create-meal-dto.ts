import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMealDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  recipe: string;

  @IsNotEmpty()
  @IsString()
  ingredients: string;
}
