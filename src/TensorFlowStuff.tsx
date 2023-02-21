import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";

export function TensorFlowStuff() {
  const messages = useModel();

  return (
    <>
      {messages.map((message, i) => {
        return <Text key={i}>{message}</Text>;
      })}
    </>
  );
}

function useModel() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const log = (message: string) => {
      setMessages((curr) => [...curr, message]);
    };

    (async () => {
      await tf.ready();
      log("ready");

      // Create a simple model.
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
      log("created model");

      // Prepare the model for training: Specify the loss and the optimizer.
      model.compile({ loss: "meanSquaredError", optimizer: "sgd" });
      log("compiled model");

      // Generate some synthetic data for training. (y = 2x - 1)
      const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
      const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

      // Train the model using the data.
      await model.fit(xs, ys, { epochs: 250 });
      log("trained model");

      const prediction = (
        model.predict(tf.tensor2d([20], [1, 1])) as tf.Tensor
      ).dataSync();

      log(`prediction: ${prediction.join(", ")}`);
    })();
  }, [setMessages]);

  return messages;
}
