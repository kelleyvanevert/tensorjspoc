export type Mood = {
    name: string
    value: number
  }
  
export const Moods: Mood[] = [
{
    name: 'Happy',
    value: 1
},
{
    name: 'Sad',
    value: -1
},
{
    name: 'NO EMA',
    value: 0
},
]

export interface IContext {
    timestamp: number;
    evening: number;
    weekend: number;

    happy: number;
    sad: number;
    energetic: number;
    relaxed: number;
    stressed: number;
    fatigued: number;
    [key: string]: number;
}

export function createDefaultContext(): IContext {
    return {
      timestamp: Date.now(),
      evening: 0,
      weekend: 0,
      happy: 0,
      sad: 0,
      energetic: 0,
      relaxed: 0,
      stressed: 0,
      fatigued: 0
    };
  }


  export function generateContext(mood: Mood): IContext {
    const context = createDefaultContext();
    if (mood.name === "Happy") {
      context.happy = 1;
    } else if (mood.name === "Sad") {
      context.sad = 1;
    }
    return context;
  }



