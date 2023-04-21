import {
  Mood,
  createDefaultContext,
  generateContext,
  processContext,
  createDefaultProcessedContext,
  IContext,
  IProcessedContext,
} from "../interfaces";

import {
    MEAN_POSITIVE_IN_MRT,
    MEAN_NEGATIVE_IN_MRT,
} from "../interfaces/IContext";



describe("createDefaultContext()", () => {
  it("should create an object with all values set to 0", () => {
    const defaultContext: IContext = {
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
    expect(createDefaultContext()).toEqual(defaultContext);
  });
});

describe("createDefaultProcessedContext()", () => {
  it("should create an object with evening, weekend, positive, and negative set to 0", () => {
    const defaultProcessedContext: IProcessedContext = {
      evening: 0,
      weekend: 0,
      positive: 0,
      negative: 0,
    };
    expect(createDefaultProcessedContext()).toEqual(defaultProcessedContext);
  });
});

describe("generateContext()", () => {
  it("should generate a context object with happy, relaxed, and energetic set to 5 when the mood is Happy", () => {
    const mood: Mood = {
      name: "Happy",
      value: 1,
    };
    const expected: IContext = {
      timestamp: Date.now(),
      latest_ema_timestamp: Date.now(),
      evening: 0,
      weekend: 0,
      happy: 5,
      sad: 0,
      energetic: 5,
      relaxed: 5,
      stressed: 0,
      fatigued: 0,
      frustrated: 0,
      positive: 0,
      negative: 0,
    };
    expect(generateContext(mood)).toEqual(expected);
  });

  it("should generate a context object with sad, stressed, fatigued, and frustrated set to 5 when the mood is Sad", () => {
    const mood: Mood = {
      name: "Sad",
      value: -1,
    };
    const expected: IContext = {
      timestamp: Date.now(),
      latest_ema_timestamp: Date.now(),
      evening: 0,
      weekend: 0,
      happy: 0,
      sad: 5,
      energetic: 0,
      relaxed: 0,
      stressed: 5,
      fatigued: 5,
      frustrated: 5,
      positive: 0,
      negative: 0,
    };
    expect(generateContext(mood)).toEqual(expected);
  });
});

describe("processContext()", () => {
  it("should set evening to 1 if timestamp is after the evening cutoff time", () => {
    const context: IContext = {
      timestamp: new Date("2023-04-20T20:00:00").getTime(),
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
    const expected: IProcessedContext = {
      evening: 1,
      weekend: 0,
      negative: -0.48,
      positive: -0.5900000000000001,
    };
    expect(processContext(context)).toEqual(expected);
  });

  it("should set weekend to 1 if timestamp is on a weekend", () => {
    const context: IContext = {
      timestamp: new Date("2023-04-22T12:00:00").getTime(),
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
    const expected: IProcessedContext = {
      evening: 0,
      weekend: 1,
      positive: 0,
      negative: 0,
    };
    expect(processContext(context)).toEqual(expected);
  });

  it("should calculate the correct positive and negative values if the latest EMA is recent enough", () => {
    const context: IContext = {
      timestamp: new Date("2023-04-20T12:00:00").getTime(),
      latest_ema_timestamp: new Date("2023-04-20T10:00:00").getTime(),
      evening: 0,
      weekend: 0,
      happy: 5,
      sad: 1,
      energetic: 5,
      relaxed: 5,
      stressed: 2,
      fatigued: 3,
      frustrated: 4,
      positive: 0,
      negative: 0,
    };
    const expected: IProcessedContext = {
      evening: 0,
      weekend: 0,
      positive: (5 + 5 + 5 - MEAN_POSITIVE_IN_MRT * 3) / (3 * 5),
      negative: (1 + 2 + 3 + 4 - MEAN_NEGATIVE_IN_MRT * 4) / (4 * 5),
    };
    expect(processContext(context)).toEqual(expected);
  });

  it('should set positive and negative to 0 if the latest EMA is not recent enough', () => {
    const context: IContext = {
        timestamp: new Date('2023-04-20T12:00:00').getTime(),
        latest_ema_timestamp: new Date('2023-04-19T10:00:00').getTime(),
        evening: 0,
        weekend: 0,
        happy: 5,
        sad: 1,
        energetic: 5,
        relaxed: 5,
        stressed: 2,
        fatigued: 3,
        frustrated: 4,
        positive: 0,
        negative: 0,
    };
    const expected: IProcessedContext = {
        evening: 0,
        weekend: 0,
        positive: 0,
        negative: 0,
      };
      expect(processContext(context)).toEqual(expected);
    });

    it('should return a default processed context with all values set to 0 if context is empty', () => {
        const expected: IProcessedContext = {
            evening: 0,
            weekend: 0,
            positive: 0,
            negative: 0,
        };
        expect(processContext({})).toEqual(expected);
    });

    it('should be able to handle an object with extra keys without throwing an error', () => {
        const context: any = {
            timestamp: new Date('2023-04-20T12:00:00').getTime(),
            latest_ema_timestamp: new Date('2023-04-20T10:00:00').getTime(),
            evening: 0,
            weekend: 0,
            happy: 5,
            sad: 1,
            energetic: 5,
            relaxed: 5,
            stressed: 2,
            fatigued: 3,
            frustrated: 4,
            positive: 0,
            negative: 0,
            extra_key: 1,
        };
        expect(() => {
            processContext(context);
        }).not.toThrow();
    });

    it('should be able to handle an object with some but not all keys in IContext without throwing an error', () => {
        const context: any = {
            timestamp: new Date('2023-04-20T12:00:00').getTime(),
            latest_ema_timestamp: new Date('2023-04-20T10:00:00').getTime(),
            evening: 0,
            happy: 5,
            sad: 1,
            energetic: 5,
            relaxed: 5,
            positive: 0,
        };
        expect(() => {
            processContext(context);
        }).not.toThrow();
    });
});
