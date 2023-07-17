import { Injectable } from '@nestjs/common';
import { DailySchedule } from '@prisma/client';
import { GPTService } from '../gpt/gpt.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { CreateMealDto } from './dto/create-meal-dto';

interface Meals {
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface WeeklyMenu {
  Monday: Meals;
  Tuesday: Meals;
  Wednesday: Meals;
  Thursday: Meals;
  Friday: Meals;
  Saturday: Meals;
  Sunday: Meals;
}

interface Meal {
  Breakfast: string;
  Lunch: string;
  Dinner: string;
}

interface WeekMenu {
  [day: string]: Meal;
}

@Injectable()
export class MealsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly gptService: GPTService,
    private readonly userService: UserService,
  ) {}

  async createMeal(mealData: CreateMealDto) {
    return this.prismaService.meal.create({
      data: {
        ...mealData,
      },
    });
  }

  async getMeal(title: string, excluded: string) {
    const a = this.gptService.queryChat(this.generateQuestion(title, excluded));
    return this.formatText((await a).response.choices[0].text);
  }

  async getDBWeeklySchedule(userId: string){
    return this.prismaService.weeklySchedule.findFirst({
      where: {
        userId
      },
      include:{dailySchedules:true}
    })
  }

  async getWeeklyScheduleForUser(userId: string) {
    const a = await this.gptService.queryChat(
      await this.generateQuestionForLoggedInUser(userId),
    );

    const h = this.parseMenu(a.response.choices[0].text);
    
    await this.prismaService.weeklySchedule.create({
      data: {
        userId,
        dailySchedules:{
          createMany:{
            data: Object.keys(h).map((day) => {

              const c: { day: string, breakfast: string, lunch: string, dinner: string} = { day: day,
                lunch: h[day]["Lunch"], 
                breakfast: h[day]["Breakfast"],
                dinner: h[day]["Dinner"],

              }

              return c;
            })

              
          }
          
        }
      }
    }) 
    return h;
  }

  generateQuestion(title: string, excluded: string) {
    return (
      'Get me meal with title, image url, ingredients and preparation steps for ' +
      title +
      ', and it should be without ' +
      excluded
    );
  }

  formatMenuText(menuText: string): WeeklyMenu {
    const weeklyMenu: WeeklyMenu = {
      Monday: { breakfast: '', lunch: '', dinner: '' },
      Tuesday: { breakfast: '', lunch: '', dinner: '' },
      Wednesday: { breakfast: '', lunch: '', dinner: '' },
      Thursday: { breakfast: '', lunch: '', dinner: '' },
      Friday: { breakfast: '', lunch: '', dinner: '' },
      Saturday: { breakfast: '', lunch: '', dinner: '' },
      Sunday: { breakfast: '', lunch: '', dinner: '' },
    };

    const days = Object.keys(weeklyMenu);

    const menuLines = menuText.split('\n').filter((line) => line.trim() !== '');

    let currentDayIndex = 0;
    let currentMealIndex = 0;
    console.log(menuText);
    for (let i = 0; i < menuLines.length; i++) {
      const line = menuLines[i];

      if (days.includes(line)) {
        currentDayIndex = days.indexOf(line);
        currentMealIndex = 0;
      } else {
        weeklyMenu[days[currentDayIndex]][
          Object.keys(weeklyMenu[days[currentDayIndex]])[currentMealIndex]
        ] = line.replace(/^\w+: /, '');

        currentMealIndex++;
      }
    }

    return weeklyMenu;
  }

  parseMenu(menuText: string): WeekMenu {
    const menuObject = JSON.parse(menuText);
    return menuObject as WeekMenu;
  }

  async generateQuestionForLoggedInUser(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });
    const userAlergies =
      user.allergies.length > 0 ? user.allergies.join(', ') : undefined;
    const userPreferences =
      user.preferredFood.length > 0 ? user.preferredFood.join(', ') : undefined;
    const userDisliked =
      user.dislikedFood.length > 0 ? user.dislikedFood.join(', ') : undefined;
    const userDietType = user.diet.length > 0 ? user.diet.join(',') : undefined;
    const preferedTypeOfCousine =
      user.typeOfCuisine.length > 0 ? user.typeOfCuisine.join(',') : undefined;

    let questionString =
      'Get me a weekly meal plan as JSON object, with three meals per day.';
    if (userAlergies) {
      questionString += 'I am alergic to ' + userAlergies + '. ';
    }
    if (userPreferences) {
      questionString += 'I prefer food ' + userPreferences + '. ';
    }

    if (userDisliked) {
      questionString += 'I dont like food ' + userDisliked + '. ';
      +'. ';
    }

    if (userDietType) {
      questionString += 'I am supposed to be on diet  ' + userDietType + '. ';
    }

    if (preferedTypeOfCousine) {
      questionString +=
        'I prefer type of cousine ' + preferedTypeOfCousine + '. ';
    }

    return questionString;
  }

  formatText(text: string) {
    const recipeLines = text.split('\n').filter((line) => line.trim() !== '');
    const titleLine = recipeLines.shift();
    const imageUrlLine = recipeLines.shift();

    const title = titleLine.replace('Title:', '').trim();
    const imageUrl = imageUrlLine.replace('Image URL:', '').trim();

    const ingredients: string[] = [];
    const preparation: string[] = [];
    let currentSection: 'ingredients' | 'preparation' | 'none' = 'none';

    for (const line of recipeLines) {
      if (line.startsWith('Ingredients:')) {
        currentSection = 'ingredients';
        continue;
      }
      if (line.startsWith('Preparation')) {
        currentSection = 'preparation';
        continue;
      }

      if (currentSection === 'ingredients') {
        ingredients.push(line.trim());
      } else if (currentSection === 'preparation') {
        preparation.push(line.trim());
      }
    }

    return { title, imageUrl, ingredients, preparation };
  }

  async getDailyMeals(userId: string, day: string) {
    const week = await this.getDBWeeklySchedule(userId);
    const d = week.dailySchedules.find((el) => el.day === day);
    const breakfastResp = await this.gptService.queryChat(
      await this.generateForDailyMealQuestion(d['breakfast'],userId),
    );
    console.log(breakfastResp);
    const brDTO = this.formatText(breakfastResp.response.choices[0].text)

    const prep = brDTO.preparation.join('\n')
    const ing = brDTO.ingredients.join('\n');
    console.log(prep, ing);
    // const newBreakfast = await this.createMeal({...brDTO, recipe: prep, ingredients: ing})

    ////////

    const lunchResp = await this.gptService.queryChat(
      await this.generateForDailyMealQuestion(d['lunch'],userId),
    );

    const lunchDTO = this.formatText(lunchResp.response.choices[0].text)

    const Luprep = brDTO.preparation.join('\n')
    const Luing = brDTO.ingredients.join('\n');
    // const newLunch = await this.createMeal({...lunchDTO, recipe: Luprep, ingredients: Luing})


    //////

    const dinner = await this.gptService.queryChat(
      await this.generateForDailyMealQuestion(d['breakfast'],userId),
    );


    const dinnerDto = this.formatText(dinner.response.choices[0].text)

    const dinnerprep = brDTO.preparation.join('\n')
    const dinnering = brDTO.ingredients.join('\n');
    // const newDinner = await this.createMeal({ recipe: dinnerprep, ingredients: dinnering, title: })


    return {
      "breakfast": brDTO, 
      "lunch": lunchDTO, 
      "dinner": dinnerDto
    }
  }

  async generateForDailyMealQuestion(mealname: string, userId: string) {

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });
    const userAlergies =
      user.allergies.length > 0 ? user.allergies.join(', ') : undefined;
    const userPreferences =
      user.preferredFood.length > 0 ? user.preferredFood.join(', ') : undefined;
    const userDisliked =
      user.dislikedFood.length > 0 ? user.dislikedFood.join(', ') : undefined;
    const userDietType = user.diet.length > 0 ? user.diet.join(',') : undefined;
    const preferedTypeOfCousine =
      user.typeOfCuisine.length > 0 ? user.typeOfCuisine.join(',') : undefined;

    let questionString ='Get me meal with title, image url, ingredients and preparation steps for ' + mealname;
    if (userAlergies) {
      questionString += 'I am alergic to ' + userAlergies + '. ';
    }
    if (userPreferences) {
      questionString += 'I prefer food ' + userPreferences + '. ';
    }

    if (userDisliked) {
      questionString += 'I dont like food ' + userDisliked + '. ';
      +'. ';
    }

    if (userDietType) {
      questionString += 'I am supposed to be on diet  ' + userDietType + '. ';
    }

    if (preferedTypeOfCousine) {
      questionString +=
        'I prefer type of cousine ' + preferedTypeOfCousine + '. ';
    }

     return questionString;
  }
}
