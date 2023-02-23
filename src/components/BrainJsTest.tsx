import React, {useEffect, useState} from 'react';
// @ts-ignore
import brain from 'brain.js/browser';
import {Text} from 'react-native';
import TrainedModel from './trained_model.json';

export function BrainJsTest() {
  const [output, setOutput] = useState<any>('todo');

  useEffect(() => {
    const net = new brain.NeuralNetwork({
      binaryThresh: 0.5,
      hiddenLayers: [3],
      activation: 'sigmoid',
      leakyReluAlpha: 0.01,
    });

    net.train([
      {input: [0, 0], output: [0]},
      {input: [0, 1], output: [1]},
      {input: [1, 0], output: [1]},
      {input: [1, 1], output: [0]},
    ]);

    // or:
    // net.fromJSON(TrainedModel as any);

    const output = net.run([1, 0]); // [0.9xxx]

    setOutput(output);
  }, []);

  return <Text>{JSON.stringify(output, null, 2)}</Text>;
}
