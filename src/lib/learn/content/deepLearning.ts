import type { Course } from "../types";

export const deepLearning: Course = {
  slug: "deep-learning",
  title: "Neural Networks & Deep Learning",
  tagline: "From a single neuron to attention",
  level: "Advanced",
  accent: "from-indigo-500 to-blue-700",
  description:
    "Open the black box. Build up from the perceptron to multilayer networks, understand how backpropagation and modern optimizers actually train them, and see why convolutions and attention reshaped the field.",
  modules: [
    {
      slug: "neural-network-fundamentals",
      title: "Neural Network Fundamentals",
      description: "Neurons, nonlinearity, and the algorithm that trains them.",
      lessons: [
        {
          slug: "perceptron-to-mlp",
          title: "From Perceptron to Multilayer Networks",
          minutes: 14,
          objectives: [
            "Describe a neuron as a weighted sum passed through an activation",
            "Explain why nonlinear activations are what give depth its power",
            "Trace how layers compose simple features into complex ones",
          ],
          blocks: [
            {
              kind: "p",
              text: "A **neuron** is almost embarrassingly simple: multiply each input by a weight, add them up with a bias, and pass the result through an **activation function**. The perceptron — one neuron with a step activation — was drawing decision boundaries in 1958. Everything since is about wiring neurons together.",
            },
            {
              kind: "code",
              caption: "One neuron, then a layer of them.",
              code: "def neuron(inputs, weights, bias):\n    z = sum(x * w for x, w in zip(inputs, weights)) + bias\n    return max(0.0, z)  # ReLU activation\n\ndef layer(inputs, weight_rows, biases):\n    return [neuron(inputs, w, b) for w, b in zip(weight_rows, biases)]\n\n# A network = layers feeding layers: outputs of one become\n# inputs of the next.",
            },
            {
              kind: "heading",
              text: "Why nonlinearity is everything",
            },
            {
              kind: "p",
              text: "Stack linear layers without activations and the whole stack collapses into one linear map — a hundred layers with the expressive power of one. The activation function breaks that collapse. With nonlinearities between layers, a network with enough hidden units can approximate essentially any continuous function — the **universal approximation** property.",
            },
            {
              kind: "table",
              headers: ["Activation", "Formula", "Character"],
              rows: [
                ["Sigmoid", "1 / (1 + e^-z)", "Squashes to (0,1); saturates at both ends, gradients vanish"],
                ["Tanh", "tanh(z)", "Squashes to (-1,1); zero-centered, still saturates"],
                ["ReLU", "max(0, z)", "Cheap, non-saturating for z>0; the modern default"],
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Depth builds features hierarchically",
              text: "Early layers learn simple detectors (edges, in images; character patterns, in text); later layers combine them into parts, then wholes. Depth is not just capacity — it is compositional reuse: complex features assembled from shared simple ones.",
            },
            {
              kind: "p",
              text: "A **multilayer perceptron (MLP)** — input layer, one or more hidden layers, output layer — is the base architecture. The output layer matches the task: a single sigmoid unit for binary classification, a **softmax** over classes for multi-class, a plain linear unit for regression.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "The perceptron's famous limit",
              text: "A single neuron draws one line (hyperplane). Problems whose classes cannot be separated by a line — the XOR pattern is the classic — are unlearnable without a hidden layer. One hidden layer dissolves the limitation; this discovery is why hidden layers exist.",
            },
          ],
          quiz: [
            {
              id: "pm-1",
              prompt: "What happens if you stack many linear layers with NO activation functions between them?",
              options: [
                "The network becomes infinitely expressive",
                "The stack collapses into a single equivalent linear transformation",
                "Training becomes impossible",
                "The network memorizes the data",
              ],
              answer: 1,
              explanation:
                "A composition of linear maps is itself a linear map. Without nonlinear activations, depth adds parameters but zero expressive power.",
            },
            {
              id: "pm-2",
              prompt: "A single perceptron cannot learn XOR because:",
              options: [
                "XOR has too many examples",
                "XOR's classes cannot be separated by a single line",
                "The step activation is too slow",
                "XOR requires probabilistic outputs",
              ],
              answer: 1,
              explanation:
                "One neuron draws one hyperplane. XOR's positive cases sit diagonally, unseparable by any single line — a hidden layer is required to compose two lines.",
            },
            {
              id: "pm-3",
              prompt: "Why did ReLU largely replace sigmoid in hidden layers?",
              options: [
                "ReLU outputs probabilities",
                "Sigmoid saturates at both ends, shrinking gradients, while ReLU keeps them alive for positive inputs",
                "ReLU uses less memory per neuron",
                "Sigmoid cannot be differentiated",
              ],
              answer: 1,
              explanation:
                "Deep sigmoid networks suffer vanishing gradients: each saturated layer multiplies the gradient by a near-zero slope. ReLU passes gradient 1 for positive inputs, keeping deep training viable.",
            },
            {
              id: "pm-4",
              prompt: "For 10-class classification, the standard output layer is:",
              options: [
                "Ten ReLU units",
                "A softmax over ten units, giving a probability distribution",
                "One sigmoid unit",
                "A single linear unit rounded to the nearest class",
              ],
              answer: 1,
              explanation:
                "Softmax exponentiates and normalizes the ten scores into probabilities summing to 1 — the natural pairing with cross-entropy loss for multi-class problems.",
            },
            {
              id: "pm-5",
              prompt: "\"Depth builds features hierarchically\" means:",
              options: [
                "Deeper layers use higher-precision numbers",
                "Later layers combine earlier layers' simple detectors into progressively more abstract features",
                "Each layer sees more raw data",
                "Depth reduces the parameter count",
              ],
              answer: 1,
              explanation:
                "Early layers detect primitives (edges, textures); later layers compose them into parts and wholes. This shared, compositional structure is why depth beats width for complex data.",
            },
          ],
          practice: [
            { slug: "perceptron-algorithm", title: "The Perceptron Learning Algorithm", difficulty: "Medium" },
            { slug: "softmax-function", title: "Numerically Stable Softmax", difficulty: "Easy" },
          ],
        },
        {
          slug: "backpropagation",
          title: "Backpropagation",
          minutes: 15,
          objectives: [
            "Explain training as loss minimization by gradient descent",
            "Describe the forward and backward passes",
            "Connect the chain rule to gradients flowing through layers",
          ],
          blocks: [
            {
              kind: "p",
              text: "Training a network means choosing millions of weights so a **loss function** — the measured badness of predictions — is as small as possible. Gradient descent does it iteratively: compute the gradient (each weight's effect on the loss), then nudge every weight a small step downhill. **Backpropagation** is the algorithm that computes all those gradients efficiently.",
            },
            {
              kind: "heading",
              text: "Forward pass, backward pass",
            },
            {
              kind: "list",
              ordered: true,
              items: [
                "**Forward pass:** feed the input through the layers, caching each intermediate value, and compute the loss at the end.",
                "**Backward pass:** starting from the loss, apply the chain rule layer by layer in reverse, computing how much each cached value — and each weight — contributed to the loss.",
                "**Update:** move every weight opposite its gradient, scaled by the learning rate.",
              ],
            },
            {
              kind: "formula",
              formula: "dL/dw = dL/da · da/dz · dz/dw",
              explanation:
                "The chain rule: a weight's effect on the loss is the product of local derivatives along the path from that weight to the loss.",
            },
            {
              kind: "code",
              caption: "Backprop through one sigmoid neuron, by hand.",
              code: "def train_step(x, y, w, b, lr):\n    # forward (cache z and a)\n    z = w * x + b\n    a = 1 / (1 + 2.718281828 ** (-z))   # sigmoid\n    loss = (a - y) ** 2\n    # backward (chain rule, reusing cached values)\n    dL_da = 2 * (a - y)\n    da_dz = a * (1 - a)\n    dL_dz = dL_da * da_dz\n    w -= lr * dL_dz * x   # dz/dw = x\n    b -= lr * dL_dz       # dz/db = 1\n    return w, b, loss",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Why backprop is fast",
              text: "Naively, each of a million weights would need its own forward evaluation to estimate its gradient. Backprop shares the work: one forward pass and one backward pass compute ALL gradients exactly, because intermediate derivatives are computed once and reused down every path.",
            },
            {
              kind: "heading",
              text: "When gradients misbehave",
            },
            {
              kind: "p",
              text: "The chain rule multiplies many local derivatives. If most are below 1, the product shrinks exponentially with depth — **vanishing gradients**, and early layers stop learning. If most exceed 1, it explodes — training diverges. Non-saturating activations (ReLU), careful **initialization**, normalization layers, and **gradient clipping** (capping the gradient's norm) are the standard defenses.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Verify gradients numerically",
              text: "A subtly wrong gradient still trains — just badly, and silently. The numerical gradient check compares analytic gradients against finite differences (nudge a weight by epsilon, remeasure the loss). It is the unit test of hand-written backprop.",
            },
          ],
          quiz: [
            {
              id: "bp-1",
              prompt: "What does backpropagation actually compute?",
              options: [
                "The model's final predictions",
                "The gradient of the loss with respect to every weight, via the chain rule",
                "The optimal learning rate",
                "The number of layers needed",
              ],
              answer: 1,
              explanation:
                "Backprop is a gradient-computation algorithm. The update itself is gradient descent; backprop supplies the per-weight derivatives it needs, all in one backward sweep.",
            },
            {
              id: "bp-2",
              prompt: "Why are intermediate values cached during the forward pass?",
              options: [
                "To display them for debugging",
                "The backward pass reuses them in the chain-rule products, avoiding recomputation",
                "To detect overfitting",
                "Caching is optional and purely for speed of the forward pass",
              ],
              answer: 1,
              explanation:
                "Local derivatives like da/dz = a(1−a) are expressed in terms of forward-pass values. Caching them makes the backward pass a cheap reuse rather than a fresh forward computation.",
            },
            {
              id: "bp-3",
              prompt: "Vanishing gradients occur when:",
              options: [
                "The learning rate is set to zero",
                "Many chained local derivatives below 1 multiply into an exponentially tiny gradient for early layers",
                "The loss reaches its minimum",
                "The dataset is too small",
              ],
              answer: 1,
              explanation:
                "The chain rule multiplies derivatives layer by layer. Saturated activations contribute near-zero slopes, and the product decays exponentially with depth — early layers receive almost no learning signal.",
            },
            {
              id: "bp-4",
              prompt: "Gradient clipping defends against:",
              options: [
                "Vanishing gradients",
                "Exploding gradients — updates so large that training diverges",
                "Overfitting",
                "Slow data loading",
              ],
              answer: 1,
              explanation:
                "Clipping caps the gradient's norm before the update, bounding the step size when chained derivatives multiply into huge values. It does nothing for gradients that are too small.",
            },
            {
              id: "bp-5",
              prompt: "The numerical gradient check works by:",
              options: [
                "Training two models and comparing them",
                "Comparing analytic gradients against finite-difference estimates from tiny weight perturbations",
                "Checking that the loss is positive",
                "Counting the network's parameters",
              ],
              answer: 1,
              explanation:
                "Nudging one weight by epsilon and remeasuring the loss estimates its true gradient. Agreement with the analytic value certifies the backprop implementation.",
            },
          ],
          practice: [
            { slug: "numerical-gradient-check", title: "Numerical Gradient Check", difficulty: "Medium" },
            { slug: "gradient-clipping", title: "Clip Gradients by Global Norm", difficulty: "Easy" },
          ],
        },
        {
          slug: "optimizers",
          title: "Optimizers: SGD, Momentum, and Adam",
          minutes: 13,
          objectives: [
            "Explain mini-batch SGD and the learning-rate trade-off",
            "Describe what momentum adds to plain gradient descent",
            "Outline Adam's per-parameter adaptive steps and learning-rate schedules",
          ],
          blocks: [
            {
              kind: "p",
              text: "Computing the exact gradient over millions of examples for every step is wasteful. **Stochastic gradient descent (SGD)** estimates it from a small random **mini-batch** — noisier, but dozens of cheap noisy steps beat one perfect expensive one. The noise even helps escape poor regions of the loss surface.",
            },
            {
              kind: "heading",
              text: "The learning rate: the most important knob",
            },
            {
              kind: "p",
              text: "Too small, and training crawls. Too large, and steps overshoot the valley — loss oscillates or diverges. Because the ideal step size shrinks as you approach a minimum, **schedules** decay the learning rate over training: step decay, cosine decay, and a brief **warmup** at the start to stabilize early updates.",
            },
            {
              kind: "p",
              text: "**Momentum** treats the parameters like a heavy ball: each update is a running average of recent gradients. Consistent directions accumulate speed; zigzagging directions cancel out. Ravine-shaped losses — steep sideways, gentle forward — train dramatically faster with momentum.",
            },
            {
              kind: "code",
              caption: "SGD with momentum.",
              code: "def momentum_step(w, grad, velocity, lr=0.01, beta=0.9):\n    velocity = beta * velocity + grad      # running average of gradients\n    w = w - lr * velocity\n    return w, velocity\n\n# beta=0.9 means roughly: average over the last ~10 gradients.",
            },
            {
              kind: "heading",
              text: "Adam: adaptive steps per parameter",
            },
            {
              kind: "p",
              text: "**Adam** keeps two running averages per parameter: the gradient (momentum) and the squared gradient (a scale estimate). Dividing the first by the square root of the second gives each parameter its own effective step size — parameters with consistently large gradients get damped, rarely-updated ones get boosted. Bias-correction terms fix the averages' early-training underestimate. Adam is the default optimizer for most deep learning because it works well with little tuning.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Batch size is a trade, not a target",
              text: "Small batches: noisy gradients, more regularizing, less memory. Large batches: accurate gradients, better hardware utilization, but often need learning-rate adjustments to generalize as well. There is no universally correct batch size — only trade-offs against your budget.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Diverging loss? Check the learning rate first",
              text: "A loss curve that climbs or NaNs is almost always a too-large learning rate (or missing gradient clipping), not a broken architecture. Drop the rate by 10x before debugging anything else.",
            },
          ],
          quiz: [
            {
              id: "opt-1",
              prompt: "Why does SGD use mini-batches instead of the full dataset per step?",
              options: [
                "Full-dataset gradients are mathematically incorrect",
                "Cheap noisy gradient estimates allow many more updates per unit of compute",
                "Mini-batches prevent all overfitting",
                "Datasets cannot fit on disk",
              ],
              answer: 1,
              explanation:
                "A mini-batch gradient is an unbiased but noisy estimate at a fraction of the cost. Many quick approximate steps make far more progress than few exact ones — and the noise adds mild regularization.",
            },
            {
              id: "opt-2",
              prompt: "A training loss that oscillates wildly or diverges most likely indicates:",
              options: [
                "Too few layers",
                "A learning rate set too high",
                "Too much training data",
                "A perfect model",
              ],
              answer: 1,
              explanation:
                "Oversized steps overshoot the loss valley and bounce outward. Reducing the learning rate (or clipping gradients) is the standard first fix.",
            },
            {
              id: "opt-3",
              prompt: "What does momentum add to plain SGD?",
              options: [
                "A larger batch size",
                "A running average of gradients that accelerates consistent directions and cancels zigzags",
                "Per-layer learning rates",
                "Automatic early stopping",
              ],
              answer: 1,
              explanation:
                "Momentum accumulates velocity along directions where gradients agree across steps, and averages away oscillation — especially effective in ravine-shaped loss surfaces.",
            },
            {
              id: "opt-4",
              prompt: "Adam differs from SGD-with-momentum mainly by:",
              options: [
                "Not using gradients at all",
                "Also tracking squared gradients to give each parameter its own adaptive step size",
                "Requiring a fixed learning rate",
                "Updating only the output layer",
              ],
              answer: 1,
              explanation:
                "Adam normalizes each parameter's momentum by a running estimate of its gradient magnitude, so step sizes adapt per parameter — the key to its low-tuning reliability.",
            },
            {
              id: "opt-5",
              prompt: "Why do learning-rate schedules DECAY the rate over training?",
              options: [
                "To save electricity",
                "Early training benefits from large exploratory steps; convergence needs small precise ones",
                "Because optimizers slow down anyway",
                "To increase gradient noise over time",
              ],
              answer: 1,
              explanation:
                "Far from a minimum, big steps make fast progress; near it, the same steps overshoot. Decaying the rate matches step size to the phase of training.",
            },
          ],
          practice: [
            { slug: "momentum-gradient-descent", title: "Momentum Gradient Descent", difficulty: "Medium" },
            { slug: "learning-rate-schedules", title: "Learning-Rate Schedules", difficulty: "Medium" },
            { slug: "sgd-linear-regression", title: "SGD Linear Regression", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      slug: "training-deep-networks",
      title: "Training Deep Networks",
      description: "The regularization and normalization toolkit that makes depth trainable.",
      lessons: [
        {
          slug: "regularization-for-networks",
          title: "Regularizing Neural Networks",
          minutes: 13,
          objectives: [
            "Apply dropout and explain why it prevents co-adaptation",
            "Use early stopping as validation-driven regularization",
            "Place weight decay and data augmentation in the toolkit",
          ],
          blocks: [
            {
              kind: "p",
              text: "Deep networks have millions of parameters — enough to memorize most training sets outright. Regularization is the set of techniques that spends that capacity on generalizable patterns instead of noise. Four tools do most of the work.",
            },
            {
              kind: "heading",
              text: "Dropout",
            },
            {
              kind: "p",
              text: "During training, **dropout** randomly zeroes each hidden unit with probability p on every step, and scales the survivors by 1/(1−p) — the **inverted dropout** convention that keeps expected activations constant. At test time the full network runs unchanged. Units can no longer rely on specific partners existing, so fragile co-adapted detectors give way to independently useful features — like a team forced to cross-train because random members miss every practice.",
            },
            {
              kind: "code",
              caption: "Inverted dropout on one activation vector.",
              code: "import random\n\ndef inverted_dropout(activations, p, rng):\n    keep = 1.0 - p\n    return [\n        (a / keep) if rng.random() > p else 0.0\n        for a in activations\n    ]\n# Test time: no masking, no scaling — expected values already match.",
            },
            {
              kind: "heading",
              text: "Early stopping",
            },
            {
              kind: "p",
              text: "Track the validation loss during training. It falls, flattens, then rises — the rise marks the switch from learning signal to memorizing noise. **Early stopping** keeps the weights from the validation minimum. It is regularization with zero extra cost, and its 'patience' parameter (how long to wait past a plateau) is its only knob.",
            },
            {
              kind: "list",
              items: [
                "**Weight decay (L2):** penalize large weights each update, biasing toward smoother functions — the network cousin of ridge regression.",
                "**Data augmentation:** train on label-preserving transformations (flipped or cropped images, paraphrased text). More effective data variety without more labeling.",
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Regularizers stack",
              text: "Dropout, weight decay, early stopping, and augmentation address different failure paths and are routinely combined. Tune the strongest lever for your setting first — for vision that is usually augmentation; for small tabular networks, weight decay and early stopping.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Dropout is a training-time behavior",
              text: "Forgetting to disable dropout at evaluation time silently degrades predictions with random masking. Frameworks separate train/eval modes precisely for this — a classic bug when writing networks by hand.",
            },
          ],
          quiz: [
            {
              id: "reg-1",
              prompt: "Why does dropout improve generalization?",
              options: [
                "It makes the network smaller permanently",
                "Units cannot co-adapt to specific partners, so each learns independently useful features",
                "It speeds up the forward pass",
                "It increases the learning rate automatically",
              ],
              answer: 1,
              explanation:
                "With partners randomly vanishing every step, a unit relying on a fragile conspiracy of specific other units fails often — robust, self-sufficient features survive.",
            },
            {
              id: "reg-2",
              prompt: "In inverted dropout with keep probability 0.8, surviving activations are:",
              options: [
                "Multiplied by 0.8",
                "Divided by 0.8, keeping the expected activation unchanged",
                "Left untouched",
                "Set to 1",
              ],
              answer: 1,
              explanation:
                "Scaling survivors by 1/0.8 compensates for the zeroed 20%, so downstream layers see the same expected magnitude in training as at test time — when no masking occurs.",
            },
            {
              id: "reg-3",
              prompt: "Early stopping halts training when:",
              options: [
                "Training loss reaches zero",
                "Validation loss stops improving and begins to rise",
                "The learning rate decays to zero",
                "All batches have been seen once",
              ],
              answer: 1,
              explanation:
                "Rising validation loss while training loss still falls marks the onset of memorization. Stopping there — and keeping the best-validation weights — is free regularization.",
            },
            {
              id: "reg-4",
              prompt: "Flipping and cropping training images is an example of:",
              options: [
                "Data leakage",
                "Data augmentation — label-preserving transforms that add effective training variety",
                "Feature scaling",
                "Test-set expansion",
              ],
              answer: 1,
              explanation:
                "A flipped cat is still a cat. Augmentation multiplies training diversity without new labels, teaching invariances the task demands.",
            },
            {
              id: "reg-5",
              prompt: "A hand-written network performs worse at evaluation than training loss suggests. A classic culprit is:",
              options: [
                "The test set is too easy",
                "Dropout left active during evaluation, randomly zeroing activations",
                "The loss function is too smooth",
                "Batch size mismatch",
              ],
              answer: 1,
              explanation:
                "Dropout is a training-only behavior. Left on at eval, it randomly deletes features from every prediction — frameworks' train/eval modes exist to prevent exactly this.",
            },
          ],
          practice: [
            { slug: "inverted-dropout", title: "Inverted Dropout Mask", difficulty: "Medium" },
            { slug: "hinge-loss-eval", title: "Hinge and Squared Hinge Loss", difficulty: "Medium" },
          ],
        },
        {
          slug: "normalization-layers",
          title: "Normalization: BatchNorm and LayerNorm",
          minutes: 12,
          objectives: [
            "Explain what normalization layers compute and why they stabilize training",
            "Contrast batch normalization with layer normalization",
            "Connect initialization to healthy signal propagation",
          ],
          blocks: [
            {
              kind: "p",
              text: "As training updates every layer at once, the distribution of each layer's inputs keeps shifting under it — every layer chases a moving target. **Normalization layers** re-standardize intermediate activations, keeping their scale predictable so larger learning rates work and depth stays trainable.",
            },
            {
              kind: "heading",
              text: "Batch norm vs. layer norm",
            },
            {
              kind: "p",
              text: "**Batch normalization** standardizes each feature using the mean and variance across the current mini-batch, then applies a learned scale (gamma) and shift (beta) so the network keeps its expressive freedom. At inference it uses running averages collected during training. **Layer normalization** instead standardizes across the features of each individual example — no batch dependence at all.",
            },
            {
              kind: "table",
              headers: ["", "Batch norm", "Layer norm"],
              rows: [
                ["Statistics over", "The batch, per feature", "The features, per example"],
                ["Batch-size sensitivity", "Yes — unstable when tiny", "None"],
                ["Train vs. inference", "Different (running averages)", "Identical"],
                ["Typical home", "CNNs / vision", "Transformers / sequences"],
              ],
            },
            {
              kind: "code",
              caption: "Layer norm for a single example.",
              code: "def layer_norm(features, gamma, beta, eps=1e-5):\n    n = len(features)\n    mean = sum(features) / n\n    var = sum((f - mean) ** 2 for f in features) / n\n    return [\n        gamma[i] * (features[i] - mean) / (var + eps) ** 0.5 + beta[i]\n        for i in range(n)\n    ]",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Why transformers picked layer norm",
              text: "Sequence batches mix wildly different lengths, and inference often runs one example at a time — batch statistics would be noisy or unavailable. Layer norm's per-example statistics behave identically in every setting, which is why it became the transformer's standard.",
            },
            {
              kind: "heading",
              text: "Initialization: starting healthy",
            },
            {
              kind: "p",
              text: "Weights initialized too large make activations explode layer by layer; too small, and they fade to zero. Principled schemes (Xavier/Glorot for tanh, He for ReLU) scale initial random weights by the layer's size so signal variance is preserved through depth. Good initialization plus normalization is what lets very deep networks train at all.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Gamma and beta are not bureaucracy",
              text: "Pure standardization would forbid layers from ever producing non-standardized outputs, shrinking the function space. The learned scale and shift restore that freedom — normalization stabilizes the OPTIMIZATION, without constraining what the network can express.",
            },
          ],
          quiz: [
            {
              id: "nm-1",
              prompt: "What problem do normalization layers primarily address?",
              options: [
                "Too many parameters",
                "Constantly shifting activation distributions that destabilize deep training",
                "Slow data loading",
                "Label noise",
              ],
              answer: 1,
              explanation:
                "With every layer updating simultaneously, each layer's input distribution drifts every step. Re-standardizing keeps scales predictable, enabling higher learning rates and stable depth.",
            },
            {
              id: "nm-2",
              prompt: "Batch norm and layer norm differ in that:",
              options: [
                "Only batch norm has learnable parameters",
                "Batch norm averages over the batch per feature; layer norm averages over features per example",
                "Layer norm requires labels",
                "Batch norm only works on text",
              ],
              answer: 1,
              explanation:
                "The normalization axis is the whole difference — and it drives every practical consequence, including batch-size sensitivity and train/inference asymmetry.",
            },
            {
              id: "nm-3",
              prompt: "Why does batch norm behave differently at inference than during training?",
              options: [
                "It is disabled entirely at inference",
                "It switches from batch statistics to running averages collected during training",
                "It recomputes gamma and beta",
                "It normalizes the labels instead",
              ],
              answer: 1,
              explanation:
                "A single inference example has no batch to average over, so batch norm applies the population statistics it tracked during training — a train/test asymmetry layer norm avoids.",
            },
            {
              id: "nm-4",
              prompt: "Transformers standardized on layer norm because:",
              options: [
                "It is older and better tested",
                "Its per-example statistics are independent of batch size and identical at training and inference",
                "It has fewer parameters",
                "Batch norm is patented",
              ],
              answer: 1,
              explanation:
                "Variable-length sequence batches and single-example inference make batch statistics unreliable. Layer norm sidesteps the batch entirely.",
            },
            {
              id: "nm-5",
              prompt: "The purpose of the learned gamma (scale) and beta (shift) is to:",
              options: [
                "Slow down training for stability",
                "Restore the layer's freedom to produce non-standardized outputs when useful",
                "Store the batch statistics",
                "Replace the activation function",
              ],
              answer: 1,
              explanation:
                "Forcing all activations to mean-0/variance-1 forever would shrink the expressible function space. Gamma and beta let the network undo or adjust the normalization wherever that helps.",
            },
          ],
          practice: [
            { slug: "layernorm-forward", title: "Layer Normalization Forward Pass", difficulty: "Medium" },
            { slug: "vision-zscore-standardize", title: "Vision Z-Score Standardization", difficulty: "Easy" },
          ],
        },
      ],
    },
    {
      slug: "architectures",
      title: "Architectures",
      description: "Convolutions for space, attention for sequences.",
      lessons: [
        {
          slug: "convolutional-networks",
          title: "Convolutional Neural Networks",
          minutes: 14,
          objectives: [
            "Describe convolution as a small filter slid across the input",
            "Explain parameter sharing and translation robustness",
            "Trace how stacked conv and pooling layers grow receptive fields",
          ],
          blocks: [
            {
              kind: "p",
              text: "A fully-connected layer on a modest 224×224 image needs tens of millions of weights per layer — and treats pixel (0,0) and pixel (100,100) as unrelated inputs, ignoring everything we know about images. **Convolutions** exploit that structure: nearby pixels are related, and a pattern is the same pattern wherever it appears.",
            },
            {
              kind: "heading",
              text: "The convolution operation",
            },
            {
              kind: "p",
              text: "A **kernel** (filter) is a small grid of weights — 3×3 is typical. It slides across the input, computing a weighted sum at every position; the output **feature map** records how strongly the pattern matched at each location. A layer learns many kernels, each becoming a detector: an edge orientation, a texture, a color transition.",
            },
            {
              kind: "code",
              caption: "1-D valid convolution — the same sliding logic as 2-D.",
              code: "def conv1d_valid(signal, kernel):\n    k = len(kernel)\n    return [\n        sum(signal[i + j] * kernel[j] for j in range(k))\n        for i in range(len(signal) - k + 1)\n    ]\n\n# conv1d_valid([1, 2, 3, 4], [1, -1]) -> [-1, -1, -1]\n# (a rising-edge detector firing at every step)",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Parameter sharing is the masterstroke",
              text: "The same 9 kernel weights scan every position, replacing millions of per-position parameters. This buys three things at once: a tiny parameter count, robustness to translation (a cat detector works anywhere in the frame), and features learned from every patch of every image.",
            },
            {
              kind: "heading",
              text: "Pooling and receptive fields",
            },
            {
              kind: "p",
              text: "**Pooling** downsamples feature maps — max pooling keeps each window's strongest response — shrinking computation and adding tolerance to small shifts. As conv and pooling layers stack, each deeper unit indirectly sees a larger patch of the original image: its **receptive field**. Early layers see edges in 3×3 windows; deep layers see object parts spanning most of the frame. The classic CNN is exactly this: conv, activation, pool, repeated, with a small classifier head on top.",
            },
            {
              kind: "table",
              headers: ["Design choice", "What it controls"],
              rows: [
                ["Kernel size", "Spatial extent each layer inspects directly"],
                ["Stride", "Step size of the slide — larger stride downsamples"],
                ["Padding", "Border handling — 'same' padding preserves size"],
                ["Channels", "Number of distinct detectors per layer"],
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Convolutions assume locality",
              text: "The inductive bias — nearby elements relate, patterns repeat across positions — is why CNNs learn images efficiently. Where it fails (relations between distant elements matter immediately), stacking convolutions to grow receptive fields is slow, and attention-based models take over.",
            },
          ],
          quiz: [
            {
              id: "cnn-1",
              prompt: "What does parameter sharing mean in a CNN?",
              options: [
                "Two networks share one GPU",
                "The same small kernel weights are applied at every spatial position",
                "All layers use identical weights",
                "Parameters are averaged across training runs",
              ],
              answer: 1,
              explanation:
                "One kernel scans the whole input, so a handful of weights replaces a per-position parameter set — massively fewer parameters, and detectors that work anywhere in the frame.",
            },
            {
              id: "cnn-2",
              prompt: "A feature map records:",
              options: [
                "The raw input pixels",
                "How strongly a kernel's pattern matched at each position",
                "The network's classification output",
                "The gradient magnitudes",
              ],
              answer: 1,
              explanation:
                "Each output position is the kernel's weighted sum at that location — a spatial map of pattern-match strength for that particular detector.",
            },
            {
              id: "cnn-3",
              prompt: "Max pooling contributes:",
              options: [
                "More trainable parameters",
                "Downsampling plus tolerance to small spatial shifts",
                "Higher-resolution feature maps",
                "Nonlinearity between channels",
              ],
              answer: 1,
              explanation:
                "Keeping each window's strongest response shrinks the map (less compute downstream) and makes the representation indifferent to exactly which pixel within the window fired.",
            },
            {
              id: "cnn-4",
              prompt: "A deep conv unit's receptive field is:",
              options: [
                "Always 3x3 pixels",
                "The region of the original input that can influence its value — growing with depth",
                "The number of kernels in its layer",
                "The size of its gradient",
              ],
              answer: 1,
              explanation:
                "Each layer sees a window of the previous layer's windows, compounding spatial reach with depth. That growth is how local 3x3 operations end up recognizing whole objects.",
            },
            {
              id: "cnn-5",
              prompt: "The inductive bias that makes CNNs efficient on images is:",
              options: [
                "Pixels are statistically independent",
                "Nearby pixels are related and patterns repeat across positions",
                "Images always contain objects",
                "Color matters more than shape",
              ],
              answer: 1,
              explanation:
                "Locality and translation invariance are properties of natural images that convolutions hard-code, so the network need not spend data learning them.",
            },
          ],
          practice: [
            { slug: "conv1d-valid", title: "1-D Convolution (Valid Mode)", difficulty: "Medium" },
            { slug: "conv2d-forward", title: "2-D Convolution Forward Pass", difficulty: "Hard" },
            { slug: "pooling-1d", title: "1-D Max and Average Pooling", difficulty: "Medium" },
          ],
        },
        {
          slug: "attention-and-transformers",
          title: "Attention and Transformers",
          minutes: 16,
          objectives: [
            "Explain why recurrent processing struggles with long sequences",
            "Describe scaled dot-product attention via queries, keys, and values",
            "Outline multi-head attention, positional encoding, and the transformer block",
          ],
          blocks: [
            {
              kind: "p",
              text: "Sequences were long processed **recurrently**: read one token at a time, carrying a running memory. Two problems proved fatal at scale. Information from early tokens must survive hundreds of squeezes through the memory bottleneck (vanishing gradients again, through time), and the strict one-at-a-time order wastes parallel hardware.",
            },
            {
              kind: "heading",
              text: "Attention: every position looks at every other",
            },
            {
              kind: "p",
              text: "**Attention** replaces the relay race with direct access. Each position emits a **query** (what am I looking for?), a **key** (what do I contain?), and a **value** (what do I contribute?). A position's output is a weighted average of all values, weighted by how well its query matches each key — similarity scores softmaxed into weights. Any token can draw from any other in one step, however far apart.",
            },
            {
              kind: "formula",
              formula: "Attention(Q, K, V) = softmax(Q·Kᵀ / √d) · V",
              explanation:
                "Dot products of queries with keys, scaled by √d to keep softmax gradients healthy at high dimension, then used to mix the values.",
            },
            {
              kind: "code",
              caption: "Attention weights for one query.",
              code: "import math\n\ndef attention_weights(query, keys):\n    d = len(query)\n    scores = [\n        sum(q * k for q, k in zip(query, key)) / math.sqrt(d)\n        for key in keys\n    ]\n    peak = max(scores)\n    exps = [math.exp(s - peak) for s in scores]\n    total = sum(exps)\n    return [e / total for e in exps]",
            },
            {
              kind: "p",
              text: "**Multi-head attention** runs several attention operations in parallel on learned projections of the input, then concatenates the results. Each head can specialize — one tracking syntax-like relations, another tracking nearby context — where a single head would have to average all relation types together.",
            },
            {
              kind: "heading",
              text: "The transformer block",
            },
            {
              kind: "list",
              items: [
                "**Positional encoding:** attention itself is order-blind — a set operation. Position information (sinusoidal patterns or learned vectors) is added to the input embeddings so word order exists at all.",
                "**Feed-forward block:** after attention mixes information ACROSS positions, a small two-layer MLP processes each position independently.",
                "**Residual connections + layer norm** wrap both sub-layers, keeping gradients healthy through dozens of stacked blocks.",
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Why transformers won",
              text: "Every position processes in parallel (hardware-friendly training at internet scale), any two positions connect in one step (no long-range decay), and the same block stacks cleanly to enormous depth. That combination — not any single trick — is what displaced recurrence across language, vision, and audio.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "The quadratic bill",
              text: "All-pairs attention costs O(n²) in sequence length — doubling context quadruples compute and memory. Long-context efficiency (sparse, windowed, and approximate attention) remains an active engineering frontier.",
            },
          ],
          quiz: [
            {
              id: "at-1",
              prompt: "The core advantage of attention over recurrent processing is:",
              options: [
                "It uses fewer parameters",
                "Any position can access any other directly, in parallel, instead of through a sequential memory bottleneck",
                "It removes the need for training",
                "It only processes important words",
              ],
              answer: 1,
              explanation:
                "Recurrence forces information through a step-by-step relay that decays with distance and serializes computation. Attention gives every pair of positions a direct, parallel connection.",
            },
            {
              id: "at-2",
              prompt: "In attention, a position's output is:",
              options: [
                "Its own value unchanged",
                "A weighted average of all values, weighted by query-key similarity",
                "The maximum of all keys",
                "A random sample of other positions",
              ],
              answer: 1,
              explanation:
                "Queries score against keys; softmax turns scores into weights; the output mixes the values by those weights — content-based routing of information.",
            },
            {
              id: "at-3",
              prompt: "Why are attention scores divided by √d before the softmax?",
              options: [
                "To make the math shorter",
                "High-dimensional dot products grow large, saturating softmax and killing gradients — scaling keeps them in a healthy range",
                "To normalize the values to probabilities",
                "To reduce memory usage",
              ],
              answer: 1,
              explanation:
                "Dot-product magnitude grows with dimension d. Unscaled, softmax saturates into near-one-hot weights with vanishing gradients; dividing by √d keeps the distribution trainable.",
            },
            {
              id: "at-4",
              prompt: "Positional encodings exist because:",
              options: [
                "GPUs require indexed inputs",
                "Attention is order-blind — without injected position information, a sentence is just a bag of tokens",
                "They compress the vocabulary",
                "They prevent overfitting",
              ],
              answer: 1,
              explanation:
                "Attention treats its inputs as a set; permuting tokens permutes outputs identically. Adding position signals to embeddings is what makes word order visible at all.",
            },
            {
              id: "at-5",
              prompt: "The main scaling limitation of standard attention is:",
              options: [
                "It cannot run on multiple GPUs",
                "Compute and memory grow quadratically with sequence length",
                "It only supports vocabularies under 50k",
                "Softmax cannot be parallelized",
              ],
              answer: 1,
              explanation:
                "Scoring all pairs of n positions costs O(n²). Long documents and high-resolution inputs make this the binding constraint, driving research into efficient attention variants.",
            },
          ],
          practice: [
            { slug: "scaled-dot-attention", title: "Scaled Dot-Product Attention", difficulty: "Medium" },
            { slug: "multi-head-attention", title: "Multi-Head Attention with Output Projection", difficulty: "Hard" },
            { slug: "positional-encoding", title: "Sinusoidal Positional Encoding", difficulty: "Medium" },
            { slug: "transformer-ffn-block", title: "Transformer Feed-Forward Block", difficulty: "Hard" },
          ],
        },
      ],
    },
  ],
};
