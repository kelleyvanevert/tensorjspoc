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
    happy: number | undefined;
    sad: number | undefined;
    [key: string]: number;
}


export function generateContext(mood:Mood): IContext { 
    if (mood.name == "Happy") {
        return {happy: 1, sad: 0}
    } else if (mood.name == "Sad") {  
        return {happy: 0, sad: 1}
    } else {
        return {happy: 0, sad: 0}
    }
    
}




