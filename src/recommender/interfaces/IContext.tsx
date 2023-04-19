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

const MEAN_POSITIVE_IN_MRT = 2.95;
const MEAN_NEGATIVE_IN_MRT = 2.4;
const MIN_EMA_RECENCY_IN_HOURS = 8;
const EVENING_CUTOFF = 18;

export interface IContext {
    timestamp: number | undefined;
    latest_ema_timestamp: number | undefined;
    evening: number | undefined;
    weekend: number | undefined;


    happy: number | undefined;
    sad: number | undefined;
    energetic: number | undefined;
    relaxed: number | undefined;
    stressed: number | undefined;
    fatigued: number | undefined;
    frustrated: number | undefined;
    positive: number | undefined;
    negative: number | undefined;
    // positive = (happy + relaxed + energetic - 8.91) / 15
    // negative = (sad + stressed + fatigued + frustrated - 9.60) / 20
    [key: string]: number | undefined;
}

export interface IProcessedContext {
    evening: number;
    weekend: number;
    positive: number;
    negative: number;
    [key: string]: number;
}


export function createDefaultContext(): IContext {
    return {
      timestamp: Date.now(),
      latest_ema_timestamp: Date.now(),
      evening: 0,
      weekend: 0,
      happy: 0,
      sad: 0,
      energetic: 0,
      relaxed: 0,
      stressed: 0,
      fatigued: 0,
      frustrated: 0,
      positive: 0,
      negative: 0,
    };
  }

  export function createDefaultProcessedContext(): IProcessedContext {
    return {
      evening: 0,
      weekend: 0,
      positive: 0,
      negative: 0,
    };
  }


  export function generateContext(mood: Mood): IContext {
    const context = createDefaultContext();
    if (mood.name === "Happy") {
      context.happy = 5;
      context.relaxed = 5;
      context.energetic = 5;
    } else if (mood.name === "Sad") {
      context.sad = 5;
      context.stressed = 5;
      context.fatigued = 5;
      context.frustrated = 5;
    }
    return context;
  }

  export function processContext(context: IContext | Object) : IProcessedContext {
    const processedContext: IProcessedContext = createDefaultProcessedContext()
    if (("timestamp" in context) && (context.timestamp != undefined)) {
        const date = new Date(context.timestamp)
        if (date.getHours() >= EVENING_CUTOFF) {
            processedContext.evening = 1
        }
        // if timestamp is on a weekend, set weekend to 1:
        if (date.getDay() === 0 || date.getDay() === 6) {
            processedContext.weekend = 1
        }
    } 

    if (("latest_ema_timestamp" in context) 
        && (context.latest_ema_timestamp != undefined) 
        && ("timestamp" in context)
        && (context.timestamp != undefined)
        && (context.timestamp - context.latest_ema_timestamp < MIN_EMA_RECENCY_IN_HOURS * 60 * 60 * 1000)) {
        processedContext.positive = (
            ( (context.happy ?? 0)+ (context.relaxed ?? 0) + (context.energetic ?? 0) - MEAN_POSITIVE_IN_MRT * 3) 
            / (3 * 5)
        )
        processedContext.negative = (
            ((context.sad ?? 0) + (context.stressed ?? 0) + (context.fatigued ?? 0) + (context.frustrated ?? 0) - MEAN_NEGATIVE_IN_MRT * 4) 
            / (4 * 5)
        )
    } 
    return processedContext;
}



