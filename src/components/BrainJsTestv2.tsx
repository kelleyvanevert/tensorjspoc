import React, { useEffect, useState } from 'react';
// @ts-ignore
import brain from 'brain.js/browser';
import { Text } from 'react-native';
import { Student, Activity, Gender, Score, Weather, TimeOfDay, TasteProfile } from '../interfaces'
import { StudentService, getRandomElement, getRandomIntInclusive } from '../services';

export function BrainJsTestv2() {
  const [output, setOutput] = useState<any>('todo');

  const createTrainingDataInput = (iterations: number): { input: Student, output: Score }[] => {
    let result = Array<{ input: Student, output: Score }>();
    const age = getRandomIntInclusive(16, 28);

    const genderValues = Object.keys(Gender)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b);
    const gender = getRandomElement(genderValues);

    const weatherValues = Object.keys(Weather)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b);
    const weather = getRandomElement(weatherValues);

    const timeValues = Object.keys(TimeOfDay)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b);
    const time = getRandomElement(timeValues);

    const weak_knee = getRandomElement([true, false])

    const activityValues = Object.keys(Activity)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b);
    const activity = getRandomElement(activityValues);

    const tasteProfileValues = Object.keys(TasteProfile)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b);
    const taste = getRandomElement(tasteProfileValues);

    for (let index = 0; index < iterations; index++) {
      const student = new StudentService(age, gender, weather, time, weak_knee, activity);
      result.push({
        input: student.createInput(),
        output: student.computeOutput(taste)
      })
    }
    return result;
  }

  useEffect(() => {
    const trainingDataInput = createTrainingDataInput(100);

    const net = new brain.NeuralNetwork({
      hiddenLayers: [4],
      activation: 'sigmoid'
    });
    const stats = net.train(trainingDataInput);
    console.log(stats);

    const testStudent = new StudentService(18, Gender.Male, Weather.Rainy, TimeOfDay.Evening, true, Activity.dancing);
    const output = net.run(testStudent.createInput());

    setOutput(output);
  }, []);

  return <Text>{JSON.stringify(output, null, 2)}</Text>;
}
