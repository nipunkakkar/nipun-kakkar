import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { trainLinearModel, networkActivations, neuronCalculation, agentExample, rankRecommendations, trainingData } from '../dist/ai-demos.js';

const initial = trainLinearModel(0);
const learned = trainLinearModel(100);
assert.equal(trainingData.length, 8);
assert.ok(learned.loss < initial.loss / 20, 'Training must materially lower error');
assert.ok(learned.weight > 0, 'The trained line should follow the positive relationship');
for (let step = 1; step <= 100; step++) assert.ok(trainLinearModel(step).loss <= trainLinearModel(step - 1).loss, 'Every training step should reduce this example’s loss');
const meanX = trainingData.reduce((total, [x]) => total + x, 0) / trainingData.length;
const meanY = trainingData.reduce((total, [, y]) => total + y, 0) / trainingData.length;
const idealWeight = trainingData.reduce((total, [x, y]) => total + (x - meanX) * (y - meanY), 0) / trainingData.reduce((total, [x]) => total + (x - meanX) ** 2, 0);
const idealBias = meanY - idealWeight * meanX;
const idealLoss = trainingData.reduce((total, [x, y]) => total + (idealWeight * x + idealBias - y) ** 2, 0) / trainingData.length;
assert.ok(learned.loss < idealLoss * 1.05, 'Gradient descent should approach the independent least-squares solution');
for (const inputs of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
  const activations = networkActivations(...inputs);
  assert.equal(activations.length, 6);
  assert.ok(activations.every(value => value >= 0 && value <= 1));
}
assert.notEqual(networkActivations(0, 0)[5], networkActivations(1, 0)[5]);
assert.notEqual(networkActivations(0, 0)[5], networkActivations(0, 1)[5]);
for (let neuron = 0; neuron < 4; neuron++) {
  const calculation = neuronCalculation(neuron, 0.65, 0.35);
  assert.ok(Math.abs(1 / (1 + Math.exp(-calculation.sum)) - calculation.activation) < 1e-12, 'Neuron readout must agree with the displayed activation');
}
assert.ok(agentExample('policy').evidence[2].includes('45 days'));
assert.ok(agentExample('policy').evidence[3].includes('30 days'));
assert.ok(agentExample('support', false).evidence[3].includes('identity check'));
assert.ok(agentExample('support', true).evidence[3].includes('identity is confirmed'));
assert.equal(rankRecommendations([1, 0, 0])[0].title, 'Orbit');
assert.equal(rankRecommendations([0, 0, 1])[0].title, 'Weekend Mix');
assert.equal(rankRecommendations([0, 0, 0]).length, 0);
assert.ok(rankRecommendations([1, 1, 1]).every(movie => movie.score >= 0 && movie.score <= 1));

const html = await readFile('dist/index.html', 'utf8');
assert.ok(!html.includes('Resume.docx'));
assert.ok(!html.includes('Kakkar.</span>'));
assert.ok(!html.includes('wordmark-dot'));
assert.ok(!html.includes('AI, from idea'));
assert.ok(!html.includes('GOOD CONVERSATIONS'));
assert.ok(html.includes('Let’s connect.</span>'));
assert.ok(!html.includes('More learning along the way'));
assert.ok(!html.includes('Where the journey began'));
assert.ok(html.includes('Educational Qualifications'));
assert.equal((html.match(/data-photo=/g) || []).length, 5);
assert.equal((html.match(/role="tab"/g) || []).length, 5);
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target = match[1];
  if (/^(https?:|mailto:)/.test(target)) continue;
  await access('dist/' + target);
}
for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) {
  assert.ok(html.includes(`id="${match[1]}"`));
}
const pdf = await readFile('dist/assets/Nipun_Kakkar_Resume.pdf');
assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
console.log(JSON.stringify({initialLoss: initial.loss, finalLoss: learned.loss, photoCount:5, expertiseTabs:5, localAssets:'all present', resumePdfBytes:pdf.length}, null, 2));
