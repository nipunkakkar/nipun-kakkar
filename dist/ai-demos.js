export const trainingData = [
  [0.08, 0.19], [0.19, 0.25], [0.31, 0.4], [0.43, 0.43],
  [0.56, 0.57], [0.68, 0.65], [0.8, 0.77], [0.92, 0.8],
];

export function trainLinearModel(steps) {
  let weight = -0.6;
  let bias = 0.85;
  for (let step = 0; step < Math.max(0, Math.min(100, Math.floor(steps))); step++) {
    let weightGradient = 0;
    let biasGradient = 0;
    for (const [x, y] of trainingData) {
      const error = weight * x + bias - y;
      weightGradient += 2 * error * x / trainingData.length;
      biasGradient += 2 * error / trainingData.length;
    }
    weight -= 0.35 * weightGradient;
    bias -= 0.35 * biasGradient;
  }
  const loss = trainingData.reduce((total, [x, y]) => total + (weight * x + bias - y) ** 2, 0) / trainingData.length;
  return { weight, bias, loss };
}

export function networkActivations(inputA, inputB) {
  const sigmoid = value => 1 / (1 + Math.exp(-value));
  const a = Math.max(0, Math.min(1, inputA));
  const b = Math.max(0, Math.min(1, inputB));
  const hidden = [sigmoid(2.4 * a - 1.2 * b - 0.4), sigmoid(-1.8 * a + 2.2 * b + 0.1), sigmoid(1.1 * a + 1.5 * b - 1.1)];
  return [a, b, ...hidden, sigmoid(1.6 * hidden[0] - 1.1 * hidden[1] + 1.3 * hidden[2] - 0.65)];
}

export function neuronCalculation(index, inputA, inputB) {
  const values = networkActivations(inputA, inputB);
  const rows = [[2.4, -1.2], [-1.8, 2.2], [1.1, 1.5], [1.6, -1.1, 1.3]];
  const biases = [-0.4, 0.1, -1.1, -0.65];
  const inputs = index === 3 ? values.slice(2, 5) : values.slice(0, 2);
  const sum = rows[index].reduce((total, weight, i) => total + weight * inputs[i], biases[index]);
  return { inputs, weights: rows[index], bias: biases[index], sum, activation: values[index === 3 ? 5 : index + 2] };
}

export function agentExample(kind, identityVerified = false) {
  if (kind === 'support') return {
    question: 'I can’t sign in. Can you reset my password?',
    messages: [
      'The planner identifies an account-access request and selects the sample helpdesk policy.',
      'The retrieval step finds the reset policy rather than guessing how to resolve the ticket.',
      identityVerified ? 'The reviewer sees that the required identity check is complete.' : 'The reviewer catches a missing prerequisite: identity has not been verified.',
      identityVerified ? 'The response can offer the reset instructions. This illustration does not reset an account.' : 'The response requests identity verification before offering reset instructions.',
    ],
    evidence: [
      'Task: find the reset policy, then check its prerequisites.',
      'Sample helpdesk policy: verify the requester’s identity before offering password-reset instructions.',
      identityVerified ? 'Identity check: complete. Policy prerequisite: satisfied.' : 'Identity check: missing. The workflow must pause for verification.',
      identityVerified ? '“Your identity is confirmed. You can now follow the password-reset instructions.”' : '“Please complete the identity check before we continue with the password reset.”',
    ],
  };
  return {
    question: 'What is the return window?',
    messages: [
      'The planner identifies a policy question and asks for the relevant return rules.',
      'The retrieval step finds the part of the sample policy that answers the question.',
      'The reviewer catches an unsupported 45-day draft and corrects it against the 30-day policy.',
      'The final answer matches the retrieved document and includes the receipt condition.',
    ],
    evidence: [
      'Task: look up the return window and any conditions.',
      'Sample returns policy: items may be returned within 30 days with a receipt.',
      'Draft: 45 days → Evidence: 30 days → Correction required.',
      '“The return window is 30 days, and a receipt is required.”',
    ],
  };
}

const catalogue = [
  { title: 'Orbit', genre: 'Sci-fi', features: [0.95, 0.1, 0.05] },
  { title: 'Parallel Skies', genre: 'Sci-fi · Drama', features: [0.85, 0.55, 0.15] },
  { title: 'City Stories', genre: 'Drama', features: [0.1, 0.95, 0.25] },
  { title: 'The Long Way Home', genre: 'Drama', features: [0.2, 0.9, 0.15] },
  { title: 'Weekend Mix', genre: 'Comedy', features: [0.15, 0.3, 0.95] },
  { title: 'Cosmic Comedy', genre: 'Sci-fi · Comedy', features: [0.7, 0.15, 0.85] },
];

export function rankRecommendations(selected) {
  const norm = Math.hypot(...selected);
  if (!norm) return [];
  return catalogue.map(movie => ({
    ...movie,
    score: movie.features.reduce((total, feature, index) => total + feature * selected[index], 0) / (Math.hypot(...movie.features) * norm),
  })).sort((a, b) => b.score - a.score);
}

if (typeof document !== 'undefined') {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stageElements = [...document.querySelectorAll('[data-agent-step]')];
  const agentRun = document.getElementById('agent-run');
  const agentStep = document.getElementById('agent-step');
  const agentExplanation = document.getElementById('agent-explanation');
  const agentScenario = document.getElementById('agent-scenario');
  const identityVerified = document.getElementById('identity-verified');
  let agentIndex = -1;
  let agentTimer;
  let agentPlaying = false;
  function paintAgent() {
    const example = agentExample(agentScenario.value, identityVerified.checked);
    document.getElementById('agent-question').textContent = example.question;
    document.getElementById('identity-option').hidden = agentScenario.value !== 'support';
    stageElements.forEach((stage, index) => {
      stage.classList.toggle('is-current', index === agentIndex);
      stage.classList.toggle('is-done', index < agentIndex);
      stage.querySelector('.stage-state').textContent = index < agentIndex ? '✓' : index === agentIndex ? '•' : '';
    });
    agentExplanation.textContent = agentIndex < 0 ? 'Run the workflow, or move one step at a time.' : example.messages[agentIndex];
    const evidence = document.getElementById('agent-evidence');
    evidence.textContent = agentIndex < 0 ? 'Evidence and reasoning appear here as the workflow runs.' : example.evidence[agentIndex];
    evidence.classList.toggle('is-answer', agentIndex === 3);
    agentStep.disabled = agentPlaying || agentIndex === 3;
    agentRun.textContent = agentPlaying ? 'Pause workflow Ⅱ' : agentIndex === 3 ? 'Replay workflow ↻' : agentIndex >= 0 ? 'Continue workflow ▶' : 'Run workflow ▶';
  }
  function pauseAgent() {
    clearTimeout(agentTimer);
    agentPlaying = false;
    paintAgent();
  }
  function advanceAgent() {
    if (agentIndex < 3) agentIndex++;
    paintAgent();
  }
  function runAgent() {
    if (agentPlaying) { pauseAgent(); return; }
    if (agentIndex === 3) agentIndex = -1;
    agentPlaying = true;
    const tick = () => {
      advanceAgent();
      if (agentIndex < 3) agentTimer = setTimeout(tick, 1900);
      else { agentPlaying = false; paintAgent(); }
    };
    tick();
  }
  agentRun.addEventListener('click', runAgent);
  agentStep.addEventListener('click', advanceAgent);
  document.getElementById('agent-reset').addEventListener('click', () => { pauseAgent(); agentIndex = -1; paintAgent(); });
  function resetAgentExample() { pauseAgent(); agentIndex = -1; paintAgent(); }
  agentScenario.addEventListener('change', resetAgentExample);
  identityVerified.addEventListener('change', resetAgentExample);
  paintAgent();

  const stepsInput = document.getElementById('training-steps');
  const trainButton = document.getElementById('train-model');
  const pointGroup = document.getElementById('training-points');
  const modelLine = document.getElementById('model-line');
  const predictionHours = document.getElementById('prediction-hours');
  const chartX = x => 30 + 305 * x;
  const chartY = y => 170 - 150 * y;
  for (const [x, y] of trainingData) {
    const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    point.setAttribute('cx', chartX(x));
    point.setAttribute('cy', chartY(y));
    point.setAttribute('r', '5');
    pointGroup.append(point);
  }
  let trainingTimer;
  let trainingPlaying = false;
  function paintModel() {
    const steps = Number(stepsInput.value);
    const model = trainLinearModel(steps);
    modelLine.setAttribute('x1', chartX(0));
    modelLine.setAttribute('y1', chartY(model.bias));
    modelLine.setAttribute('x2', chartX(1));
    modelLine.setAttribute('y2', chartY(model.weight + model.bias));
    document.getElementById('training-count').textContent = steps;
    document.getElementById('training-loss').textContent = (model.loss * 10000).toFixed(1);
    stepsInput.setAttribute('aria-valuetext', `${steps} training steps, mean squared score error ${(model.loss * 10000).toFixed(1)}`);
    document.getElementById('loss-gauge-fill').style.width = `${model.loss / trainLinearModel(0).loss * 100}%`;
    const hours = Number(predictionHours.value);
    const prediction = model.weight * hours / 10 + model.bias;
    document.getElementById('prediction-hours-value').value = `${hours.toFixed(1)} hours`;
    document.getElementById('predicted-score').textContent = (prediction * 100).toFixed(1);
    document.getElementById('prediction-dot').setAttribute('cx', chartX(hours / 10));
    document.getElementById('prediction-dot').setAttribute('cy', chartY(prediction));
    document.getElementById('prediction-guides').setAttribute('d', `M30 ${chartY(prediction)} H${chartX(hours / 10)} V170`);
  }
  function pauseTraining() {
    clearInterval(trainingTimer);
    trainingPlaying = false;
    trainButton.textContent = Number(stepsInput.value) === 100 ? 'Train again ↻' : 'Train model ▶';
  }
  stepsInput.addEventListener('input', () => { pauseTraining(); paintModel(); });
  stepsInput.addEventListener('change', () => {
    document.getElementById('ml-status').textContent = `${stepsInput.value} training steps. Mean squared score error is ${(trainLinearModel(Number(stepsInput.value)).loss * 10000).toFixed(1)}.`;
  });
  trainButton.addEventListener('click', () => {
    if (trainingPlaying) { pauseTraining(); return; }
    if (Number(stepsInput.value) === 100) stepsInput.value = '0';
    trainingPlaying = true;
    trainButton.textContent = 'Pause training Ⅱ';
    trainingTimer = setInterval(() => {
      stepsInput.value = String(Math.min(100, Number(stepsInput.value) + 1));
      paintModel();
      if (Number(stepsInput.value) === 100) {
        pauseTraining();
        document.getElementById('ml-status').textContent = 'Training complete. The line now fits the example data with a lower mean squared error.';
      }
    }, 38);
  });
  document.getElementById('reset-model').addEventListener('click', () => {
    pauseTraining();
    stepsInput.value = '0';
    paintModel();
    document.getElementById('ml-status').textContent = 'Synthetic data for explaining regression, not a study-performance forecast.';
  });
  predictionHours.addEventListener('input', paintModel);
  paintModel();

  const signalA = document.getElementById('signal-a');
  const signalB = document.getElementById('signal-b');
  const neurons = [...document.querySelectorAll('[data-neuron]')];
  const inspectNeuron = document.getElementById('inspect-neuron');
  const neuralExplanation = document.getElementById('neural-explanation');
  let neuralPulseTimer;
  let layerTimers = [];
  function paintCalculation() {
    const result = neuronCalculation(Number(inspectNeuron.value), Number(signalA.value), Number(signalB.value));
    const terms = result.weights.map((weight, index) => `${index === 0 && weight >= 0 ? '' : weight < 0 ? '− ' : '+ '}${Math.abs(weight).toFixed(2)} × ${result.inputs[index].toFixed(2)}`);
    document.getElementById('neuron-formula').textContent = `Weighted sum: ${terms.join(' ')} ${result.bias < 0 ? '−' : '+'} ${Math.abs(result.bias).toFixed(2)} = ${result.sum.toFixed(2)}`;
    document.getElementById('neuron-activation').textContent = `Apply sigmoid → activation ${result.activation.toFixed(2)}`;
  }
  function highlightLayer(indices) {
    neurons.forEach((neuron, index) => neuron.classList.toggle('layer-active', indices.includes(index)));
  }
  function stopNetworkTrace() {
    clearTimeout(neuralPulseTimer);
    layerTimers.forEach(clearTimeout);
    layerTimers = [];
    document.querySelector('.neural-demo').classList.remove('is-sending');
    highlightLayer([]);
  }
  function paintNetwork() {
    const values = networkActivations(Number(signalA.value), Number(signalB.value));
    document.getElementById('signal-a-value').value = Number(signalA.value).toFixed(2);
    document.getElementById('signal-b-value').value = Number(signalB.value).toFixed(2);
    neurons.forEach((neuron, index) => {
      neuron.querySelector('text').textContent = values[index].toFixed(2);
      neuron.querySelector('text').style.fill = values[index] > 0.55 ? '#ffffff' : 'var(--ink)';
      neuron.querySelector('circle').style.fillOpacity = String(0.12 + values[index] * 0.75);
    });
    document.getElementById('network-output').textContent = values[5].toFixed(2);
    paintCalculation();
  }
  signalA.addEventListener('input', () => { stopNetworkTrace(); paintNetwork(); });
  signalB.addEventListener('input', () => { stopNetworkTrace(); paintNetwork(); });
  inspectNeuron.addEventListener('change', paintCalculation);
  document.getElementById('send-signal').addEventListener('click', () => {
    stopNetworkTrace();
    paintNetwork();
    if (!reducedMotion.matches) {
      document.querySelector('.neural-demo').classList.add('is-sending');
      highlightLayer([0, 1]);
      document.querySelectorAll('.neural-signals animateMotion').forEach(animation => animation.beginElement());
      layerTimers.push(setTimeout(() => highlightLayer([2, 3, 4]), 500));
      layerTimers.push(setTimeout(() => highlightLayer([5]), 1000));
      neuralPulseTimer = setTimeout(() => document.querySelector('.neural-demo').classList.remove('is-sending'), 1300);
    }
    neuralExplanation.textContent = 'Inputs flow into weighted sums. Sigmoid transforms those sums into activations, which feed the next layer. Inspect a neuron to see its calculation.';
  });
  paintNetwork();

  const interestButtons = [...document.querySelectorAll('[data-interest]')];
  const recommendationResults = document.getElementById('recommendation-results');
  const recommendationRows = new Map();
  function paintRecommendations() {
    const interests = interestButtons.map(button => button.getAttribute('aria-pressed') === 'true' ? 1 : 0);
    const results = rankRecommendations(interests).slice(0, 3);
    const previousPositions = new Map([...recommendationResults.children].filter(row => row.dataset.title).map(row => [row.dataset.title, row.getBoundingClientRect().top]));
    const selectedGenres = ['Sci-fi', 'Drama', 'Comedy'].filter((genre, index) => interests[index]);
    if (!results.length) {
      recommendationResults.replaceChildren();
      const empty = document.createElement('p');
      empty.className = 'rec-empty';
      empty.textContent = 'Pick at least one interest to build your recommendations.';
      recommendationResults.append(empty);
      return;
    }
    recommendationResults.querySelector('.rec-empty')?.remove();
    [...recommendationResults.children].filter(row => !results.some(movie => movie.title === row.dataset.title)).forEach(row => row.remove());
    results.forEach((movie, index) => {
      let row = recommendationRows.get(movie.title);
      if (!row) {
      row = document.createElement('div');
      row.className = 'rec-item';
      row.dataset.title = movie.title;
      const rank = document.createElement('span');
      rank.className = 'rec-rank';
      rank.textContent = String(index + 1).padStart(2, '0');
      const body = document.createElement('div');
      body.className = 'rec-content';
      const top = document.createElement('div');
      top.className = 'rec-title-row';
      const title = document.createElement('strong');
      title.textContent = movie.title;
      const score = document.createElement('span');
      score.textContent = `${Math.round(movie.score * 100)}%`;
      score.setAttribute('aria-label', `${Math.round(movie.score * 100)} percent similarity`);
      top.append(title, score);
      const genre = document.createElement('span');
      genre.className = 'rec-genre';
      genre.textContent = movie.genre;
      const track = document.createElement('div');
      track.className = 'rec-track';
      track.setAttribute('aria-hidden', 'true');
      const bar = document.createElement('span');
      bar.style.width = `${Math.round(movie.score * 100)}%`;
      track.append(bar);
      body.append(top, genre, track);
      const why = document.createElement('button');
      why.type = 'button';
      why.className = 'rec-why';
      why.textContent = 'Why this?';
      why.setAttribute('aria-label', `Why recommend ${movie.title}?`);
      why.setAttribute('aria-expanded', 'false');
      const reason = document.createElement('p');
      reason.id = `reason-${movie.title.toLowerCase().replaceAll(' ', '-')}`;
      reason.className = 'rec-reason';
      reason.hidden = true;
      why.setAttribute('aria-controls', reason.id);
      why.addEventListener('click', () => {
        reason.hidden = !reason.hidden;
        why.setAttribute('aria-expanded', String(!reason.hidden));
      });
      body.append(why, reason);
      row.append(rank, body);
      recommendationRows.set(movie.title, row);
      }
      row.querySelector('.rec-rank').textContent = String(index + 1).padStart(2, '0');
      const score = row.querySelector('.rec-title-row>span');
      score.textContent = `${Math.round(movie.score * 100)}%`;
      score.setAttribute('aria-label', `${Math.round(movie.score * 100)} percent similarity`);
      row.querySelector('.rec-track>span').style.width = `${Math.round(movie.score * 100)}%`;
      row.querySelector('.rec-reason').textContent = `Your profile: ${selectedGenres.join(' + ')}. This title has genre weights [${movie.features.map(value => value.toFixed(2)).join(', ')}] in the order sci-fi, drama, comedy. Comparing that direction with your profile gives a cosine similarity of ${movie.score.toFixed(3)}.`;
      recommendationResults.append(row);
    });
    if (!reducedMotion.matches) {
      [...recommendationResults.children].forEach(row => {
        const oldTop = previousPositions.get(row.dataset.title);
        if (oldTop !== undefined) {
          const delta = oldTop - row.getBoundingClientRect().top;
          if (Math.abs(delta) > 1) row.animate([{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }], { duration: 450, easing: 'ease-out' });
        } else row.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'ease-out' });
      });
    }
  }
  interestButtons.forEach(button => button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
    paintRecommendations();
  }));
  paintRecommendations();

  document.addEventListener('expertisechange', event => {
    if (event.detail !== 'tab-genai') pauseAgent();
    if (event.detail !== 'tab-ml') pauseTraining();
    if (event.detail !== 'tab-neural') stopNetworkTrace();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pauseAgent(); pauseTraining(); stopNetworkTrace(); }
  });
}
