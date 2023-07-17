import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class PreferencesDto {
  @IsNotEmpty()
  @IsString()
  alergies: string[];

  @IsString()
  diet: string[];

  @IsString()
  likedFood: string[];

  @IsString()
  dislikedFood: string[];
}
