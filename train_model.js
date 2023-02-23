const brain = require('brain.js');
const fs = require('fs');

// create a simple feed forward neural network with backpropagation
const net = new brain.NeuralNetwork({
  binaryThresh: 0.5,
  hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
  activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
});

net.train([
  {input: [0, 0], output: [0]},
  {input: [0, 1], output: [1]},
  {input: [1, 0], output: [1]},
  {input: [1, 1], output: [0]},
]);

const output = net.run([1, 0]); // [0.987]

fs.writeFileSync(
  './src/components/trained_model.json',
  JSON.stringify(net.toJSON(), null, 2),
  'utf8',
);

console.log(output);
