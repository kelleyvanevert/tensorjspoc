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
    name: 'Fine',
    value: 0
},
{
    name: 'Sad',
    value: -1
}
]

export interface IContext {
    mood: Number;
}
