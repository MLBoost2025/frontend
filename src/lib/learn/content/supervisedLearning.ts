import type { Course } from "../types";

export const supervisedLearning: Course = {
  slug: "supervised-learning",
  title: "Core Supervised Learning",
  tagline: "The workhorse algorithms and why they work",
  level: "Intermediate",
  accent: "from-violet-500 to-purple-600",
  description:
    "Go beyond the vocabulary and into the machinery: linear models and the losses that train them, trees and the ensembles that fix them, and the distance and probability methods that still win real problems. Every algorithm here is explained by the trade-off it makes, not just the recipe it follows.",
  modules: [
    {
      slug: "linear-models",
      title: "Linear Models",
      description:
        "Weighted sums, the losses that fit them, and the penalties that keep them honest.",
      lessons: [
        {
          slug: "linear-regression",
          title: "Linear Regression",
          minutes: 15,
          objectives: [
            "Write the linear model and the least-squares loss it minimizes",
            "Explain gradient descent as repeated downhill steps on the loss surface",
            "Interpret learned coefficients — and know when interpretation breaks",
          ],
          blocks: [
            {
              kind: "p",
              text: "Linear regression predicts a number as a **weighted sum** of the features: multiply each feature by a learned weight, add them up, add a bias. It is the simplest model that actually learns, and half of ML is elaboration on it — logistic regression, regularization, even a single neural-network neuron are all this formula with modifications.",
            },
            {
              kind: "formula",
              formula: "ŷ = w₁x₁ + w₂x₂ + … + wₙxₙ + b",
              explanation:
                "Each weight wᵢ says how much the prediction moves when feature xᵢ increases by one unit. The bias b is the prediction when every feature is zero.",
            },
            {
              kind: "heading",
              text: "Least squares: defining what a good fit means",
            },
            {
              kind: "p",
              text: "Training needs a target to optimize. Least squares scores a candidate model by the **mean squared error (MSE)**: average the squared gaps between predictions and true labels. Squaring does two jobs — it makes every error positive so they cannot cancel, and it punishes large misses far more than small ones. A model that is off by 10 hurts a hundred times more than one off by 1.",
            },
            {
              kind: "formula",
              formula: "MSE(w, b) = (1/n) Σ (ŷᵢ − yᵢ)²",
              explanation:
                "The loss is a function of the parameters, not the data — the data is fixed. Training means finding the w and b where this surface is lowest.",
            },
            {
              kind: "p",
              text: "Picture the loss as a landscape: one axis per parameter, height equal to MSE. For linear regression with squared error this landscape is a smooth bowl with a single bottom — no false valleys. **Gradient descent** finds it by repetition: compute the gradient (the direction of steepest ascent), step the opposite way, repeat. The step size is the **learning rate** — too small and training crawls, too large and you overshoot the bottom and diverge.",
            },
            {
              kind: "code",
              caption: "One feature, full-batch gradient descent — the entire algorithm.",
              code: "def train(xs, ys, lr=0.01, steps=1000):\n    w, b = 0.0, 0.0\n    n = len(xs)\n    for _ in range(steps):\n        # Gradients of MSE with respect to w and b.\n        grad_w = sum(2 * (w * x + b - y) * x for x, y in zip(xs, ys)) / n\n        grad_b = sum(2 * (w * x + b - y) for x, y in zip(xs, ys)) / n\n        w -= lr * grad_w   # step downhill\n        b -= lr * grad_b\n    return w, b",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Why gradient descent at all?",
              text: "Plain linear regression has a closed-form solution (the normal equation), so descent looks unnecessary. But the closed form does not scale to huge data and does not exist for most other models. Gradient descent does — the same loop trains logistic regression and billion-parameter networks. Learn it here, on the model where you can see everything.",
            },
            {
              kind: "heading",
              text: "Reading the coefficients",
            },
            {
              kind: "p",
              text: "A trained weight has a direct reading: **holding all other features fixed**, a one-unit increase in this feature moves the prediction by w units. If a house-price model learns w = 4.2 for area in square meters, each extra square meter adds 4.2 to the predicted price. That clause — holding others fixed — is where interpretation gets dangerous.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Two traps in coefficient reading",
              text: "First, magnitude depends on units: area-in-square-feet gets a weight about 10.8x smaller than area-in-square-meters for the same effect, so raw weight size does not rank feature importance unless features are standardized. Second, when two features are strongly correlated (area and number of rooms), the model can shift weight between them almost freely — individual coefficients become unstable even while predictions stay good.",
            },
            {
              kind: "p",
              text: "Despite its simplicity, linear regression remains a serious production tool: it trains in seconds, extrapolates predictably, and its failures are easy to diagnose. It is also the baseline every fancier regressor must beat — and on small or noisy datasets, it often is not beaten.",
            },
          ],
          quiz: [
            {
              id: "lr-1",
              prompt: "Why does the squared-error loss square the differences instead of just summing them?",
              options: [
                "Squaring makes the code run faster",
                "It keeps every error positive so they cannot cancel, and penalizes large misses disproportionately",
                "Squaring guarantees the model never overfits",
                "It converts regression into classification",
              ],
              answer: 1,
              explanation:
                "Raw differences can cancel — a +5 error and a −5 error would sum to zero, scoring a bad model as perfect. Squaring removes signs and makes a miss of 10 cost 100x a miss of 1, so the fit is pulled hard toward large errors.",
            },
            {
              id: "lr-2",
              prompt: "In gradient descent, what happens if the learning rate is set far too large?",
              options: [
                "Training converges faster with no downside",
                "Steps overshoot the minimum and the loss can oscillate or diverge",
                "The model becomes more accurate but slower",
                "The gradient becomes zero everywhere",
              ],
              answer: 1,
              explanation:
                "Each update steps a distance proportional to the learning rate. Past a certain size, steps jump over the valley floor to the other side — the loss bounces or grows instead of shrinking.",
            },
            {
              id: "lr-3",
              prompt: "A model learns weight w = 4.2 for a feature. The correct interpretation is:",
              options: [
                "The feature explains 4.2% of the variance",
                "Increasing the feature by one unit changes the prediction by 4.2, holding other features fixed",
                "The feature is 4.2 times more important than any other",
                "The model is 4.2% confident in this feature",
              ],
              answer: 1,
              explanation:
                "A coefficient is a slope: the change in prediction per unit change in that feature with everything else held constant. It is not a variance share and — unless features are standardized — not an importance ranking.",
            },
            {
              id: "lr-4",
              prompt: "Why can raw coefficient magnitudes NOT be used directly to rank feature importance?",
              options: [
                "Coefficients are always between 0 and 1",
                "Magnitude depends on the feature's units and scale, so unscaled weights are not comparable",
                "Linear models do not have coefficients",
                "Importance can only be computed by neural networks",
              ],
              answer: 1,
              explanation:
                "Measure the same quantity in different units and the weight rescales to compensate — square feet versus square meters changes the weight by ~10.8x with identical predictions. Standardize features first if you want comparable magnitudes.",
            },
            {
              id: "lr-5",
              prompt: "Why is gradient descent worth learning even though linear regression has a closed-form solution?",
              options: [
                "The closed form gives wrong answers",
                "The same descent loop generalizes to huge datasets and to models with no closed form",
                "Gradient descent always finds better minima than the closed form",
                "Closed-form solutions are illegal in production",
              ],
              answer: 1,
              explanation:
                "The normal equation solves small linear problems exactly, but it does not scale well and does not exist for logistic regression or neural networks. Gradient descent is the general-purpose engine — linear regression is just the clearest place to learn it.",
            },
          ],
          practice: [
            { slug: "mse-mae-metrics", title: "MSE and MAE Regression Metrics", difficulty: "Easy" },
            { slug: "r2-score", title: "R-squared - Coefficient of Determination", difficulty: "Easy" },
            { slug: "linear-regression-gd", title: "Linear Regression via Gradient Descent", difficulty: "Medium" },
            { slug: "sgd-linear-regression", title: "Stochastic Gradient Descent for Linear Regression", difficulty: "Medium" },
          ],
        },
        {
          slug: "logistic-regression",
          title: "Logistic Regression",
          minutes: 15,
          objectives: [
            "Explain how the sigmoid turns a weighted sum into a probability",
            "Justify log-loss as the right training objective for probabilities",
            "Distinguish predicted probabilities from thresholded class labels",
          ],
          blocks: [
            {
              kind: "p",
              text: "Despite the name, logistic regression is a **classification** algorithm. It keeps the linear model's weighted sum but answers a different question: not \"how much?\" but \"how likely?\". The trick is one extra function that converts an unbounded score into a probability.",
            },
            {
              kind: "formula",
              formula: "σ(z) = 1 / (1 + e^(−z)),  where z = w·x + b",
              explanation:
                "The sigmoid squashes any real number into (0, 1). Large positive z → probability near 1; large negative z → near 0; z = 0 → exactly 0.5.",
            },
            {
              kind: "p",
              text: "The output reads directly as a probability: σ(z) = 0.93 means the model assigns a 93% chance to the positive class. This is more information than a bare label — a spam filter that is 51% sure and one that is 99% sure should be treated differently, and only a probabilistic output lets you tell them apart.",
            },
            {
              kind: "code",
              caption: "The full prediction path: weighted sum, squash, threshold.",
              code: "import math\n\ndef sigmoid(z):\n    return 1.0 / (1.0 + math.exp(-z))\n\ndef predict_proba(x, w, b):\n    z = sum(wi * xi for wi, xi in zip(w, x)) + b\n    return sigmoid(z)\n\ndef predict_class(x, w, b, threshold=0.5):\n    return 1 if predict_proba(x, w, b) >= threshold else 0",
            },
            {
              kind: "heading",
              text: "Log-loss: grading a probability",
            },
            {
              kind: "p",
              text: "Squared error is the wrong grade for probabilities — it barely punishes confident mistakes. **Log-loss** (cross-entropy) fixes this: the penalty is the negative log of the probability assigned to the true class. Predict 0.9 for a true positive and pay 0.105; predict 0.01 for it and pay 4.6. Confidently wrong is catastrophically expensive, which is exactly the incentive you want.",
            },
            {
              kind: "formula",
              formula: "LogLoss = −(1/n) Σ [ yᵢ log(pᵢ) + (1 − yᵢ) log(1 − pᵢ) ]",
              explanation:
                "For each example only one term is active: log(p) when the true label is 1, log(1−p) when it is 0. The loss goes to infinity as confidence in the wrong answer goes to certainty.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Why not just use MSE here?",
              text: "Beyond weak penalties, MSE combined with the sigmoid produces a non-convex loss surface with flat plateaus where gradients nearly vanish — training stalls. Log-loss with the sigmoid is convex with well-behaved gradients: the same clean bowl linear regression enjoys. The loss is chosen to match the output, not by habit.",
            },
            {
              kind: "heading",
              text: "The decision boundary",
            },
            {
              kind: "p",
              text: "Where does the model switch classes? At probability 0.5 — which happens exactly where z = w·x + b = 0. That equation defines a line (in 2D), a plane (in 3D), a hyperplane in general: the **decision boundary**. Everything on one side is classified positive, everything on the other negative. The boundary is always linear in the features you give it — logistic regression can only draw curved boundaries if you hand it curved features like x².",
            },
            {
              kind: "table",
              headers: ["Model output", "Threshold 0.5", "Threshold 0.9"],
              rows: [
                ["p = 0.55", "Positive", "Negative"],
                ["p = 0.92", "Positive", "Positive"],
                ["p = 0.30", "Negative", "Negative"],
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "The threshold is a business decision, not a constant",
              text: "0.5 is only a default. A cancer screen might flag at p ≥ 0.1 because missing a case costs far more than a false alarm; a fraud-blocking system might act only at p ≥ 0.95 to avoid freezing legitimate cards. Train the probability model once; choose the threshold from the costs of each error type.",
            },
          ],
          quiz: [
            {
              id: "logr-1",
              prompt: "What role does the sigmoid function play in logistic regression?",
              options: [
                "It normalizes the input features",
                "It maps the unbounded weighted sum to a value in (0, 1) that reads as a probability",
                "It removes outliers from the training data",
                "It makes the decision boundary curved",
              ],
              answer: 1,
              explanation:
                "The linear part produces any real number; the sigmoid squashes it into (0, 1). That is what turns a score into an interpretable probability — the linear machinery underneath is unchanged.",
            },
            {
              id: "logr-2",
              prompt: "A model predicts p = 0.01 for an example whose true label is positive. Under log-loss this example:",
              options: [
                "Contributes almost nothing to the loss",
                "Contributes a very large penalty, because confident wrong predictions are punished hardest",
                "Is automatically removed from training",
                "Contributes exactly 0.01 to the loss",
              ],
              answer: 1,
              explanation:
                "The penalty is −log(0.01) ≈ 4.6, versus ≈ 0.105 for predicting 0.9. Log-loss grows without bound as confidence in the wrong class approaches certainty — that steepness is what drives the model toward calibrated probabilities.",
            },
            {
              id: "logr-3",
              prompt: "Where is the decision boundary of a logistic regression model?",
              options: [
                "Where the sigmoid output equals 1",
                "Where the weighted sum w·x + b equals 0, i.e. predicted probability 0.5",
                "At the mean of the training features",
                "Wherever the loss is minimized",
              ],
              answer: 1,
              explanation:
                "σ(0) = 0.5, so the surface z = 0 is exactly where the model is indifferent between classes. That surface is linear in the input features — a line, plane, or hyperplane.",
            },
            {
              id: "logr-4",
              prompt: "Why might a fraud-detection team move the classification threshold from 0.5 to 0.95?",
              options: [
                "Higher thresholds always improve accuracy",
                "Because blocking a legitimate card is costly, they act only when the model is very confident",
                "Because probabilities below 0.95 are miscalculated",
                "To make the model train faster",
              ],
              answer: 1,
              explanation:
                "The threshold trades one error type against the other. Raising it means fewer false alarms (frozen legitimate cards) at the cost of missing some fraud — a choice driven by the relative costs, not by the model.",
            },
            {
              id: "logr-5",
              prompt: "Logistic regression can only produce a curved decision boundary if:",
              options: [
                "The learning rate is small enough",
                "You supply nonlinear features (like x²) for it to weight",
                "You use more training epochs",
                "The threshold is set away from 0.5",
              ],
              answer: 1,
              explanation:
                "The boundary is where a weighted sum of the inputs is zero — always linear in whatever features you provide. Feed it engineered nonlinear features and the boundary is linear in those, hence curved in the originals.",
            },
          ],
          practice: [
            { slug: "log-loss-metric", title: "Binary Log Loss", difficulty: "Easy" },
            { slug: "logistic-regression-scratch", title: "Logistic Regression from Scratch", difficulty: "Medium" },
            { slug: "softmax-regression", title: "Softmax Regression by Gradient Descent", difficulty: "Medium" },
          ],
        },
        {
          slug: "regularization",
          title: "Regularization: L2, L1, and the Lambda Dial",
          minutes: 14,
          objectives: [
            "Explain how penalizing weight size combats overfitting",
            "Contrast ridge (L2) shrinkage with lasso (L1) sparsity",
            "Use lambda as a bias-variance control knob chosen by validation",
          ],
          blocks: [
            {
              kind: "p",
              text: "An overfitting linear model has a signature: **huge weights**. To thread noisy training points exactly, it balances large positive coefficients against large negative ones — a delicate cancellation that shatters on new data. Regularization attacks this directly: change the objective so the model pays for weight size, not just for prediction error.",
            },
            {
              kind: "formula",
              formula: "Ridge: minimize  MSE + λ Σ wᵢ²      Lasso: minimize  MSE + λ Σ |wᵢ|",
              explanation:
                "The penalty term competes with the data-fit term. λ (lambda) sets the exchange rate: how much training error the model will accept to keep its weights small.",
            },
            {
              kind: "p",
              text: "**Ridge (L2)** penalizes squared weights. Because the penalty's gradient is proportional to the weight itself, big weights are pushed hard and small ones gently — everything shrinks toward zero but almost never reaches it. The result is a smoother, more stable model that spreads influence across correlated features instead of betting everything on one.",
            },
            {
              kind: "p",
              text: "**Lasso (L1)** penalizes absolute values. Its pull is a constant force regardless of weight size — and a constant force can drag a weight all the way to exactly zero and pin it there. Lasso therefore performs **feature selection** as a side effect of training: features that do not pay their way are eliminated, leaving a sparse model that uses only a subset of its inputs.",
            },
            {
              kind: "table",
              headers: ["", "Ridge (L2)", "Lasso (L1)"],
              rows: [
                ["Penalty", "Sum of squared weights", "Sum of absolute weights"],
                ["Effect on weights", "All shrink, rarely exactly zero", "Many become exactly zero"],
                ["Correlated features", "Shares weight among them", "Tends to pick one, zeroes the rest"],
                ["Best when", "Many features matter a little", "Few features matter, most are noise"],
              ],
            },
            {
              kind: "code",
              caption: "Ridge is one extra term in the gradient — weight decay.",
              code: "def ridge_step(w, b, xs, ys, lr=0.01, lam=0.1):\n    n = len(xs)\n    grad_w = sum(2 * (w * x + b - y) * x for x, y in zip(xs, ys)) / n\n    grad_b = sum(2 * (w * x + b - y) for x, y in zip(xs, ys)) / n\n    w -= lr * (grad_w + 2 * lam * w)  # penalty gradient shrinks w\n    b -= lr * grad_b                  # bias is NOT penalized\n    return w, b",
            },
            {
              kind: "heading",
              text: "Lambda is the bias-variance dial",
            },
            {
              kind: "p",
              text: "λ = 0 recovers plain least squares: maximum flexibility, maximum variance. λ → ∞ crushes every weight to zero: the model predicts a constant, pure bias. In between, raising λ trades variance for bias one notch at a time. There is no formula for the right value — you sweep candidates (typically on a log scale: 0.001, 0.01, 0.1, 1, 10) and pick the one with the best **validation** error.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Regularization is a confession, priced in",
              text: "Adding a penalty deliberately makes training error worse. That is not a bug — training error was lying to you. You accept a small, controlled bias in exchange for a large drop in variance, and validation error, the number that matters, improves.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Standardize before you penalize",
              text: "The penalty treats all weights equally, but a feature measured in millimeters needs a weight 1000x larger than the same feature in meters. Without standardizing features first, λ punishes features for their units rather than their usefulness. Also note the bias term b is conventionally left unpenalized — shrinking the intercept just distorts predictions.",
            },
            {
              kind: "p",
              text: "The idea generalizes far beyond linear models: weight decay in neural networks is L2 regularization under another name, and dropout, early stopping, and pruning are all members of the same family — deliberately constraining a model so it cannot afford to memorize noise.",
            },
          ],
          quiz: [
            {
              id: "reg-1",
              prompt: "What symptom of overfitting does weight regularization directly attack?",
              options: [
                "Too few training examples",
                "Very large, delicately balanced coefficients that fit noise",
                "Features stored in the wrong units",
                "A learning rate that is too high",
              ],
              answer: 1,
              explanation:
                "Overfit linear models thread noisy points using huge canceling weights. Penalizing weight size makes that configuration expensive, forcing the model into smoother solutions that transfer to new data.",
            },
            {
              id: "reg-2",
              prompt: "Why does lasso (L1) produce exactly-zero weights while ridge (L2) does not?",
              options: [
                "Lasso deletes features before training starts",
                "L1's pull is a constant force that can drag weights fully to zero; L2's pull weakens as weights shrink",
                "Ridge cannot be trained with gradient descent",
                "Lasso only works on binary features",
              ],
              answer: 1,
              explanation:
                "The L2 gradient is proportional to the weight, so the push fades as a weight approaches zero — it lands nearby but not at zero. L1's constant-magnitude pull can reach exactly zero and hold, which is why lasso yields sparse models.",
            },
            {
              id: "reg-3",
              prompt: "As λ increases from 0 toward infinity, the model moves from:",
              options: [
                "High bias to high variance",
                "High variance to high bias",
                "Underfitting to overfitting",
                "Classification to regression",
              ],
              answer: 1,
              explanation:
                "λ = 0 is unpenalized least squares — flexible, variance-prone. Huge λ forces near-zero weights — a rigid, near-constant predictor, which is pure bias. λ slides the model along the bias-variance trade-off.",
            },
            {
              id: "reg-4",
              prompt: "How should the value of λ be chosen?",
              options: [
                "Set it to 1, the universal default",
                "Sweep candidate values and pick the one with the lowest validation error",
                "Pick whichever gives the lowest training error",
                "Derive it from the number of features",
              ],
              answer: 1,
              explanation:
                "Training error always prefers λ = 0 — the penalty only ever hurts the fit to training data. The benefit shows up on held-out data, so λ is tuned by validation, typically over a log-spaced grid.",
            },
            {
              id: "reg-5",
              prompt: "Why must features be standardized before applying a regularization penalty?",
              options: [
                "Unstandardized features cause division by zero",
                "The penalty is scale-blind, so it would punish features for their units instead of their usefulness",
                "Standardization increases the number of features",
                "Regularization only accepts values between 0 and 1",
              ],
              answer: 1,
              explanation:
                "A feature in small units needs a large weight to have the same effect, and the penalty charges for weight size. Without standardization, λ effectively regularizes each feature by an arbitrary amount set by its measurement scale.",
            },
          ],
          practice: [
            { slug: "ridge-regression-normal-equation", title: "Ridge Regression via the Normal Equation", difficulty: "Medium" },
            { slug: "sgd-linear-regression", title: "Stochastic Gradient Descent for Linear Regression", difficulty: "Medium" },
            { slug: "inverted-dropout", title: "Inverted Dropout Mask", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      slug: "trees-and-ensembles",
      title: "Trees & Ensembles",
      description:
        "Single trees, why they overfit, and the two ensemble strategies that turn them into the strongest tabular models known.",
      lessons: [
        {
          slug: "decision-trees",
          title: "Decision Trees",
          minutes: 15,
          objectives: [
            "Describe how a tree grows by greedy, impurity-reducing splits",
            "Compute Gini impurity and entropy for a node",
            "Control overfitting with depth and minimum-sample constraints",
          ],
          blocks: [
            {
              kind: "p",
              text: "A decision tree classifies by playing twenty questions with the features: *is income > 50k? is age < 30?* Each internal node asks one yes/no question about one feature; each path of answers leads to a leaf holding a prediction. Unlike linear models, a tree needs no algebra to read — you can print it and follow it by hand.",
            },
            {
              kind: "heading",
              text: "Growing the tree: greedy splits",
            },
            {
              kind: "p",
              text: "Training asks, at every node: which single question best separates the classes? The algorithm tries every feature and every threshold, scores each candidate split by how much it reduces **impurity** — how mixed the labels are — and takes the best one. Then it recurses on each side. This is **greedy**: each split is locally optimal with no lookahead, which is why training is fast and why the tree found is good but not globally optimal.",
            },
            {
              kind: "formula",
              formula: "Gini(node) = 1 − Σ pₖ²      Entropy(node) = −Σ pₖ log₂(pₖ)",
              explanation:
                "pₖ is the fraction of the node's samples in class k. Both measures are 0 for a pure node (one class only) and maximal for a 50/50 mix. In practice they choose nearly identical splits; Gini skips the logarithm and is the common default.",
            },
            {
              kind: "code",
              caption: "Scoring a candidate split: weighted impurity of the children.",
              code: "def gini(labels):\n    n = len(labels)\n    if n == 0:\n        return 0.0\n    counts = {}\n    for y in labels:\n        counts[y] = counts.get(y, 0) + 1\n    return 1.0 - sum((c / n) ** 2 for c in counts.values())\n\ndef split_score(left, right):\n    n = len(left) + len(right)\n    return (len(left) / n) * gini(left) + (len(right) / n) * gini(right)\n\n# The best split is the one that minimizes split_score —\n# i.e., produces the purest children, weighted by size.",
            },
            {
              kind: "heading",
              text: "Depth: the overfitting throttle",
            },
            {
              kind: "p",
              text: "Left unchecked, a tree keeps splitting until every leaf is pure — which usually means leaves holding one or two training examples each. Such a tree has memorized the training set, noise included: near-zero training error, poor test error. Trees are the textbook **high-variance** model: regrow one on a slightly different sample and its shape changes drastically.",
            },
            {
              kind: "table",
              headers: ["Control", "What it does", "Effect of tightening"],
              rows: [
                ["max_depth", "Caps how many questions deep a path can go", "Fewer, coarser regions — bias up, variance down"],
                ["min_samples_leaf", "Forbids leaves smaller than a minimum", "No leaves that memorize single points"],
                ["min impurity decrease", "Requires each split to help by a margin", "Prunes splits that only chase noise"],
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "A pure leaf is not a proud leaf",
              text: "One hundred percent training accuracy from a deep tree is a symptom, not an achievement. A leaf that contains three training examples is a memory, not a pattern. Depth limits and minimum leaf sizes trade a little training accuracy for a model that survives contact with new data.",
            },
            {
              kind: "heading",
              text: "Why practitioners still love single trees",
            },
            {
              kind: "p",
              text: "Trees need no feature scaling — splits compare against thresholds, so units are irrelevant. They handle mixed numeric and categorical data, capture nonlinear effects and feature interactions automatically, and remain fully **interpretable**: any individual prediction can be explained by reciting the path that produced it, a property regulators and doctors actually require.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "The setup for ensembles",
              text: "A single tree is interpretable but unstable; its accuracy ceiling is modest. The next two lessons keep the tree as a building block and fix its variance in two opposite ways — averaging many independent trees (forests) and chaining many corrective trees (boosting).",
            },
          ],
          quiz: [
            {
              id: "dt-1",
              prompt: "How does a decision tree choose its next split during training?",
              options: [
                "It picks a random feature and threshold",
                "It tries candidate splits and greedily takes the one that most reduces label impurity",
                "It solves a global optimization over all possible trees",
                "It always splits on the feature with the largest values",
              ],
              answer: 1,
              explanation:
                "Tree growth is greedy: every feature/threshold pair is scored by the weighted impurity of the resulting children, the best is taken, and the process recurses. No lookahead — fast, but only locally optimal.",
            },
            {
              id: "dt-2",
              prompt: "A node contains 50% class A and 50% class B. Its Gini impurity is:",
              options: [
                "0",
                "0.25",
                "0.5",
                "1",
              ],
              answer: 2,
              explanation:
                "Gini = 1 − (0.5² + 0.5²) = 1 − 0.5 = 0.5, the maximum for two classes. A pure node scores 0 — splits aim to move children toward that.",
            },
            {
              id: "dt-3",
              prompt: "An unlimited-depth tree reaches 100% training accuracy. The most likely explanation is:",
              options: [
                "The problem is fully solved",
                "The tree memorized the training set, growing leaves around individual noisy examples",
                "The features were perfectly scaled",
                "Gini impurity was computed incorrectly",
              ],
              answer: 1,
              explanation:
                "A tree can always drive training error to zero by splitting until leaves are tiny and pure — that is memorization. The test error, not the training error, reveals whether anything generalizable was learned.",
            },
            {
              id: "dt-4",
              prompt: "Why do decision trees NOT require feature scaling?",
              options: [
                "Trees internally standardize every feature",
                "Splits are threshold comparisons on one feature at a time, so units never mix",
                "Trees only accept binary features",
                "Scaling is done by the Gini formula",
              ],
              answer: 1,
              explanation:
                "A split like income > 50000 involves a single feature and a threshold in that feature's own units. No distances or weighted sums ever combine features, so relative scales are irrelevant — unlike kNN or regularized linear models.",
            },
            {
              id: "dt-5",
              prompt: "Which statement about tree interpretability is correct?",
              options: [
                "Trees are interpretable only when features are standardized",
                "Any single prediction can be explained by the exact sequence of decisions on its root-to-leaf path",
                "Trees are less interpretable than neural networks",
                "Interpretability requires limiting the tree to one split",
              ],
              answer: 1,
              explanation:
                "Every prediction corresponds to one path of concrete, human-readable conditions. That per-decision explainability is why trees remain the model of choice where decisions must be justified.",
            },
          ],
          practice: [
            { slug: "gini-impurity-node", title: "Gini Impurity of a Node", difficulty: "Easy" },
            { slug: "shannon-entropy", title: "Shannon Entropy of a Label Distribution", difficulty: "Easy" },
            { slug: "gini-best-split", title: "Best Decision Stump Split by Gini Impurity", difficulty: "Medium" },
            { slug: "decision-tree-depth-two", title: "Depth-Two Decision Tree", difficulty: "Hard" },
          ],
        },
        {
          slug: "bagging-random-forests",
          title: "Bagging and Random Forests",
          minutes: 14,
          objectives: [
            "Explain how bootstrap sampling creates diverse training sets from one dataset",
            "Show why averaging many high-variance trees reduces variance",
            "Describe feature subsampling and the out-of-bag error estimate",
          ],
          blocks: [
            {
              kind: "p",
              text: "Deep trees have low bias and high variance — each one fits its training sample too faithfully, noise and all. Bagging's insight: variance is noise, and noise **averages out**. Train many deep trees on different versions of the data and let them vote. Individual trees still make eccentric errors; the ensemble's average washes those errors away while keeping the shared signal.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Bootstrap sampling",
              text: "Draw n examples from your n-example dataset with replacement. Each bootstrap sample is the same size as the original but contains duplicates of some examples and omits others — on average about 63.2% of distinct examples appear, and 36.8% are left out.",
            },
            {
              kind: "code",
              caption: "Bagging in miniature: bootstrap, train, average.",
              code: "import random\n\ndef bootstrap_sample(data, rng):\n    n = len(data)\n    return [data[rng.randrange(n)] for _ in range(n)]\n\ndef bagged_predict(models, x):\n    votes = [m(x) for m in models]\n    # Classification: majority vote. Regression: mean.\n    return max(set(votes), key=votes.count)\n\n# Train each model on its own bootstrap sample:\n# models = [train_tree(bootstrap_sample(data, rng)) for _ in range(200)]",
            },
            {
              kind: "heading",
              text: "Why averaging works — and what limits it",
            },
            {
              kind: "p",
              text: "Average n **independent** estimates, each with variance σ², and the average's variance is σ²/n — more trees, steadily less noise. But bagged trees are not independent: they saw overlapping data, so their errors are correlated, and correlated errors do not cancel. The variance floor of the ensemble is set by that correlation. Once you see this, the design goal is obvious: make the trees as **decorrelated** as possible without ruining their individual accuracy.",
            },
            {
              kind: "heading",
              text: "Random forests: decorrelation by feature subsampling",
            },
            {
              kind: "p",
              text: "A random forest is bagging plus one extra randomization: at **every split**, the tree may only choose among a random subset of features (√p of the p features is the classic default for classification). Without this, one dominant feature would headline the root split of every tree, making all trees near-clones. Forcing splits to sometimes ignore the star feature makes trees genuinely different — individually a bit worse, collectively much better.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Deliberately handicapping each tree helps the team",
              text: "Feature subsampling raises each tree's error — it sometimes cannot use the best feature. The trade is worth it because ensemble variance depends on tree correlation more than on tree quality. Slightly worse but diverse voters beat excellent but identical ones.",
            },
            {
              kind: "heading",
              text: "Out-of-bag: validation for free",
            },
            {
              kind: "p",
              text: "Remember the ~36.8% of examples each bootstrap sample omits? For any example, roughly a third of the forest's trees never trained on it. Predict that example using only those trees and you have an honest, unseen-data prediction — without setting aside a validation split. Averaged over the dataset, this **out-of-bag (OOB) error** tracks test error closely and comes free with training.",
            },
            {
              kind: "table",
              headers: ["Property", "Single deep tree", "Random forest"],
              rows: [
                ["Bias", "Low", "Low (slightly higher)"],
                ["Variance", "High", "Low — averaged away"],
                ["Interpretability", "Full path per prediction", "Reduced; feature importances remain"],
                ["Tuning burden", "Depth is critical", "Robust defaults; more trees rarely hurt"],
              ],
            },
            {
              kind: "p",
              text: "Forests trade the single tree's transparency for accuracy and stability, and they are famously hard to break: adding more trees does not overfit (the average just stabilizes), and default settings land within a few points of tuned ones. That robustness made them the default first serious model on tabular data — the bar the next lesson's boosting must clear.",
            },
          ],
          quiz: [
            {
              id: "rf-1",
              prompt: "What problem of deep decision trees does bagging directly target?",
              options: [
                "Their high bias",
                "Their high variance — sensitivity to the particular training sample",
                "Their slow prediction speed",
                "Their need for feature scaling",
              ],
              answer: 1,
              explanation:
                "Deep trees fit their sample's noise, so each one errs eccentrically. Averaging many trees trained on different bootstrap samples cancels those uncorrelated errors while preserving the shared signal — variance reduction, not bias reduction.",
            },
            {
              id: "rf-2",
              prompt: "A bootstrap sample of an n-example dataset:",
              options: [
                "Contains every example exactly once, shuffled",
                "Is drawn with replacement — duplicates appear and roughly 37% of examples are left out",
                "Contains only half the examples, chosen at random",
                "Removes all outliers before sampling",
              ],
              answer: 1,
              explanation:
                "Sampling n times with replacement includes about 63.2% of distinct examples, with some drawn multiple times. The omitted ~36.8% become that tree's out-of-bag examples.",
            },
            {
              id: "rf-3",
              prompt: "Why does a random forest restrict each split to a random subset of features?",
              options: [
                "To make training faster on wide datasets",
                "To decorrelate the trees — otherwise a dominant feature makes every tree nearly identical",
                "Because trees cannot handle many features",
                "To remove noisy features permanently",
              ],
              answer: 1,
              explanation:
                "Averaging only cancels errors that differ between trees. If one strong feature anchored every tree, their errors would be correlated and averaging would gain little. Random feature subsets force diversity, which is what averaging converts into accuracy.",
            },
            {
              id: "rf-4",
              prompt: "The out-of-bag (OOB) error estimate works because:",
              options: [
                "It is computed on the training predictions of all trees",
                "Each example is predicted only by the trees whose bootstrap samples excluded it",
                "It uses a separate hold-out file created before training",
                "OOB examples are easier to classify",
              ],
              answer: 1,
              explanation:
                "For each example, roughly a third of the trees never saw it during training — their predictions on it are genuine unseen-data predictions. Aggregating these gives an honest error estimate with no separate validation split.",
            },
            {
              id: "rf-5",
              prompt: "What happens as you keep adding more trees to a random forest?",
              options: [
                "The forest eventually overfits badly",
                "Performance plateaus as the average stabilizes — more trees do not cause overfitting",
                "Bias increases linearly with tree count",
                "Each new tree must be shallower than the last",
              ],
              answer: 1,
              explanation:
                "More trees just average the same distribution more thoroughly: variance falls toward the floor set by tree correlation, then flattens. The cost of extra trees is compute, not generalization — unlike boosting, where more rounds can overfit.",
            },
          ],
          practice: [
            { slug: "decision-stump-classifier", title: "Train and Apply a Decision Stump", difficulty: "Medium" },
            { slug: "bagged-stump-forest", title: "Bagged Forest of Decision Stumps", difficulty: "Hard" },
          ],
        },
        {
          slug: "gradient-boosting",
          title: "Gradient Boosting",
          minutes: 16,
          objectives: [
            "Explain boosting as sequentially fitting models to residual errors",
            "Describe how the learning rate (shrinkage) trades off against tree count",
            "Argue why boosted trees dominate tabular ML benchmarks",
          ],
          blocks: [
            {
              kind: "p",
              text: "Bagging trains trees in parallel and averages them. Boosting takes the opposite path: train trees **in sequence**, where each new tree's entire job is to correct the mistakes of everything built so far. Instead of many independent experts voting, boosting builds one expert incrementally — a committee where each member specializes in the errors the previous members still make.",
            },
            {
              kind: "heading",
              text: "The residual-fitting loop",
            },
            {
              kind: "p",
              text: "Start with a trivial model — for regression, predict the mean of y everywhere. Compute the **residuals**: what is left of each label after the current model's prediction. Fit a small tree to predict those residuals. Add a scaled-down copy of it to the model. The residuals shrink; repeat. Each round, the labels being fit are not the original targets but the current model's remaining error — that is the whole trick.",
            },
            {
              kind: "formula",
              formula: "Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x),  where hₘ fits residuals  yᵢ − Fₘ₋₁(xᵢ)",
              explanation:
                "η (the learning rate) scales each tree's contribution. The name gradient boosting comes from the general view: for squared error the residual is exactly the negative gradient of the loss, so each tree is a step of gradient descent taken in the space of functions.",
            },
            {
              kind: "code",
              caption: "The skeleton of gradient boosting for regression.",
              code: "def boost(xs, ys, fit_weak_learner, rounds=100, lr=0.1):\n    base = sum(ys) / len(ys)          # F0: predict the mean\n    trees = []\n    preds = [base] * len(ys)\n    for _ in range(rounds):\n        residuals = [y - p for y, p in zip(ys, preds)]\n        tree = fit_weak_learner(xs, residuals)   # e.g. a shallow tree\n        preds = [p + lr * tree(x) for p, x in zip(preds, xs)]\n        trees.append(tree)\n    return base, trees\n\ndef predict(base, trees, x, lr=0.1):\n    return base + lr * sum(t(x) for t in trees)",
            },
            {
              kind: "heading",
              text: "Shrinkage: the learning rate versus the number of trees",
            },
            {
              kind: "p",
              text: "η is the most important knob. At η = 1 each tree corrects aggressively — the model fits fast and starts chasing noise within a few dozen rounds. Shrinking η to 0.1 or 0.05 makes each tree a small nudge, so hundreds or thousands of trees are needed — but many small corrections explore the function space more cautiously and generalize better. The practical recipe: pick a small η, add trees until **validation** error stops improving, then stop (early stopping).",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Boosting, unlike bagging, CAN overfit with more rounds",
              text: "A forest's extra trees only stabilize an average. A boosted model's extra trees keep reducing training error toward zero — eventually fitting noise, since every round targets whatever error remains, real or not. Tree count in boosting is a capacity knob and must be validated; in bagging it is merely a compute knob.",
            },
            {
              kind: "table",
              headers: ["", "Bagging / Random forest", "Gradient boosting"],
              rows: [
                ["Training", "Parallel, independent trees", "Sequential, each corrects the last"],
                ["Attacks", "Variance", "Bias (variance managed via shrinkage, depth, subsampling)"],
                ["Typical trees", "Deep, full-grown", "Shallow (depth 3-8 weak learners)"],
                ["More trees", "Safe — plateaus", "Can overfit — use early stopping"],
                ["Tuning", "Nearly none needed", "Learning rate, rounds, depth interact"],
              ],
            },
            {
              kind: "heading",
              text: "Why boosting wins on tabular data",
            },
            {
              kind: "p",
              text: "On structured, tabular problems — fraud scores, churn, credit risk, ranking — gradient-boosted trees (XGBoost, LightGBM, CatBoost) have dominated benchmarks and competitions for a decade, routinely beating deep networks. The reasons are structural: trees natively handle mixed feature types, missing values, arbitrary scales, and sharp threshold interactions, while boosting drives bias down relentlessly and shrinkage plus early stopping keep variance in check. Neural nets need smooth structure to exploit; tabular data rarely has it.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "One idea, seen twice",
              text: "Forests and boosting answer the same question — how do weak, flawed trees become a strong model? — with dual answers. Bagging: keep bias low, average away variance. Boosting: keep variance low with tiny trees and shrinkage, then stack corrections to drive bias down. Knowing which failure mode your problem has tells you which ensemble to reach for first.",
            },
          ],
          quiz: [
            {
              id: "gb-1",
              prompt: "In gradient boosting, what does each new tree in the sequence fit?",
              options: [
                "The original labels, on a fresh bootstrap sample",
                "The residual errors left by the model built so far",
                "A random subset of the features",
                "The predictions of the previous tree",
              ],
              answer: 1,
              explanation:
                "Each round computes what remains of the labels after current predictions — the residuals — and fits a small tree to exactly that. Adding it corrects the ensemble's remaining error; for squared loss the residual is the negative gradient, hence the name.",
            },
            {
              id: "gb-2",
              prompt: "What is the effect of using a small learning rate (η = 0.05) in boosting?",
              options: [
                "Fewer trees are needed to converge",
                "Each tree contributes a small correction, so more trees are needed but generalization typically improves",
                "The model can no longer overfit at any number of rounds",
                "Training error stops decreasing entirely",
              ],
              answer: 1,
              explanation:
                "Shrinkage scales down every tree's contribution. Progress is slower — more rounds are required — but many cautious corrections consistently generalize better than few aggressive ones. Small η plus early stopping is the standard recipe.",
            },
            {
              id: "gb-3",
              prompt: "Why can adding more rounds overfit a boosted model, when adding more trees never overfits a random forest?",
              options: [
                "Boosted trees are deeper than forest trees",
                "Each boosting round keeps reducing training error toward zero, eventually fitting noise; forest trees just stabilize an average",
                "Forests use regularization and boosting cannot",
                "Boosting reuses the same tree repeatedly",
              ],
              answer: 1,
              explanation:
                "Boosting is sequential error correction — whatever error remains, real signal or noise, the next tree attacks it. A forest's trees are independent draws being averaged; more of them only reduce variance. That is why boosting needs early stopping and bagging does not.",
            },
            {
              id: "gb-4",
              prompt: "Boosting typically uses shallow trees (depth 3-8) rather than full-grown ones because:",
              options: [
                "Deep trees are too slow to evaluate",
                "The ensemble drives bias down across rounds, so each learner should be weak and low-variance",
                "Shallow trees cannot overfit under any circumstances",
                "Gini impurity is undefined for deep trees",
              ],
              answer: 1,
              explanation:
                "Boosting's sequential corrections handle bias — each individual learner only needs to capture a little structure. Weak, shallow trees keep per-round variance small; the accumulation of many of them supplies the model's overall capacity.",
            },
            {
              id: "gb-5",
              prompt: "Which property of tabular data helps explain why boosted trees often beat neural networks on it?",
              options: [
                "Tabular datasets are always larger than image datasets",
                "Tabular signal is full of sharp thresholds, mixed types, and irregular interactions that trees model natively",
                "Neural networks cannot output probabilities",
                "Tabular data has no noise",
              ],
              answer: 1,
              explanation:
                "Trees split on thresholds, so jumps, mixed numeric/categorical features, and unscaled columns are natural to them. Networks excel where data has smooth, hierarchical structure (images, audio, text) — structure tabular data usually lacks.",
            },
          ],
          practice: [
            { slug: "gradient-boosting-stumps", title: "Gradient Boosting with Regression Stumps", difficulty: "Hard" },
            { slug: "adaboost-stumps", title: "AdaBoost with Decision Stumps", difficulty: "Hard" },
            { slug: "xgboost-leaf-weights", title: "Second-Order Leaf Weights and Split Gain", difficulty: "Hard" },
          ],
        },
      ],
    },
    {
      slug: "distance-and-probability",
      title: "Distance & Probability Methods",
      description:
        "Three classics built on geometry and Bayes' rule — and the assumptions each one bets on.",
      lessons: [
        {
          slug: "k-nearest-neighbors",
          title: "k-Nearest Neighbors",
          minutes: 14,
          objectives: [
            "Explain lazy learning: no training phase, all work at prediction time",
            "Choose k as a bias-variance dial",
            "Explain why feature scaling is mandatory and high dimensions are hostile",
          ],
          blocks: [
            {
              kind: "p",
              text: "k-nearest neighbors has the shortest training procedure in ML: **store the data**. To classify a new point, find the k stored examples closest to it and let them vote (for regression, average their labels). The entire hypothesis is *similar inputs have similar outputs* — no equation is fit, no parameters are learned.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Lazy learning",
              text: "kNN defers all computation to prediction time — hence lazy. The trade is inverted from most models: training is free, but each prediction must measure distance to potentially every stored example. Models like linear regression are eager: expensive to train, nearly free to query.",
            },
            {
              kind: "formula",
              formula: "d(a, b) = √( Σ (aᵢ − bᵢ)² )",
              explanation:
                "Euclidean distance, the usual choice. Alternatives (Manhattan, Minkowski, cosine) define different senses of \"near\" and can matter as much as k.",
            },
            {
              kind: "code",
              caption: "The complete algorithm — this is not pseudocode.",
              code: "import math\nfrom collections import Counter\n\ndef knn_predict(train, query, k=5):\n    # train: list of (features, label)\n    dists = sorted(\n        (math.dist(x, query), y) for x, y in train\n    )\n    top_k = [y for _, y in dists[:k]]\n    return Counter(top_k).most_common(1)[0][0]",
            },
            {
              kind: "heading",
              text: "Choosing k: the bias-variance dial again",
            },
            {
              kind: "p",
              text: "k = 1 trusts a single neighbor completely: the decision boundary shatters into islands around individual points, including mislabeled ones — maximum variance. k = n consults everyone and always predicts the majority class — maximum bias. In between, growing k smooths the boundary. Pick k by validation, and prefer odd values for binary problems to avoid tied votes.",
            },
            {
              kind: "table",
              headers: ["k", "Boundary", "Failure mode"],
              rows: [
                ["1", "Jagged, islands around every point", "One mislabeled neighbor flips predictions"],
                ["moderate (5-25)", "Smooth but responsive", "Usually the sweet spot — validate"],
                ["very large", "Nearly flat", "Local structure ignored; majority class dominates"],
              ],
            },
            {
              kind: "heading",
              text: "Scaling is not optional",
            },
            {
              kind: "p",
              text: "Distance treats every feature's units at face value. Put income (0-200,000) next to age (0-100) and the distance is effectively income alone — age contributes nothing to who counts as a neighbor. Standardize or min-max scale every feature first; for kNN this is not a nicety but a correctness requirement.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "The curse of dimensionality",
              text: "In high dimensions, distance itself degrades. With hundreds of features, all pairwise distances concentrate toward the same value — the nearest neighbor is barely nearer than the farthest, and data becomes so sparse that no point has genuinely local neighbors. kNN's core premise dissolves. Remedies: aggressive feature selection or dimensionality reduction before kNN, or a different model family.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Why keep kNN in the toolbox",
              text: "It makes no assumption about the shape of the boundary, adapts instantly when you add data (just store it), and is an excellent quick baseline on small, low-dimensional, well-scaled problems. When kNN beats your sophisticated model, the sophisticated model has a problem.",
            },
          ],
          quiz: [
            {
              id: "knn-1",
              prompt: "Why is kNN called a lazy learner?",
              options: [
                "It converges slowly during training",
                "It has no real training phase — all computation happens at prediction time",
                "It only works on small datasets",
                "It ignores most of the training data",
              ],
              answer: 1,
              explanation:
                "Training is just storing the examples. The expensive part — computing distances to stored points — is deferred until each query, the reverse of eager models that invest in training to make prediction cheap.",
            },
            {
              id: "knn-2",
              prompt: "Setting k = 1 gives a model with:",
              options: [
                "High bias and low variance",
                "High variance — a single noisy neighbor can flip a prediction",
                "The smoothest possible decision boundary",
                "No decision boundary at all",
              ],
              answer: 1,
              explanation:
                "With one neighbor deciding everything, the boundary forms islands around individual training points — mislabeled ones included. Increasing k averages over more neighbors, trading that variance for bias.",
            },
            {
              id: "knn-3",
              prompt: "A dataset has income (0-200,000) and age (0-100) as features. Unscaled kNN will effectively:",
              options: [
                "Weight both features equally",
                "Ignore age, because income differences dominate every distance",
                "Ignore income, because age has fewer digits",
                "Fail to run",
              ],
              answer: 1,
              explanation:
                "Euclidean distance sums squared per-feature gaps in raw units. Income gaps in the tens of thousands swamp age gaps of a few years, so neighbors are chosen by income alone. Standardizing features restores each one's voice.",
            },
            {
              id: "knn-4",
              prompt: "What does the curse of dimensionality do to kNN specifically?",
              options: [
                "It makes training slower",
                "Distances between all points become nearly equal, so \"nearest\" neighbors stop being meaningfully near",
                "It causes integer overflow in the distance formula",
                "It makes k impossible to set below 100",
              ],
              answer: 1,
              explanation:
                "In high-dimensional space, data is sparse and pairwise distances concentrate — the nearest and farthest points are almost equidistant. kNN's premise that nearby points share labels loses its force because nothing is truly nearby.",
            },
            {
              id: "knn-5",
              prompt: "Compared to linear regression, kNN's cost profile is:",
              options: [
                "Expensive training, cheap predictions",
                "Cheap training, expensive predictions that scan stored examples",
                "Expensive in both phases",
                "Cheap in both phases",
              ],
              answer: 1,
              explanation:
                "kNN stores data at training time (free) and pays per query with distance computations against the stored set. Eager models like linear regression pay once at training and answer queries with a single dot product.",
            },
          ],
          practice: [
            { slug: "knn-classifier-iris", title: "KNN Classifier on Iris", difficulty: "Easy" },
            { slug: "pairwise-distance-matrix", title: "Pairwise Euclidean Distance Matrix", difficulty: "Easy" },
            { slug: "weighted-knn", title: "Distance-Weighted KNN", difficulty: "Medium" },
            { slug: "knn-regression", title: "K-Nearest-Neighbours Regression", difficulty: "Medium" },
          ],
        },
        {
          slug: "naive-bayes",
          title: "Naive Bayes",
          minutes: 15,
          objectives: [
            "Apply Bayes' rule to turn class-conditional evidence into class probabilities",
            "State the conditional independence assumption and why it is 'naive'",
            "Explain Laplace smoothing and why text classification suits this model",
          ],
          blocks: [
            {
              kind: "p",
              text: "Naive Bayes classifies by asking the question backwards. Instead of directly modeling *which class does this input belong to*, it models *how likely would each class be to produce this input* — then uses **Bayes' rule** to invert that into the answer it needs.",
            },
            {
              kind: "formula",
              formula: "P(class | features) ∝ P(class) · P(features | class)",
              explanation:
                "Posterior ∝ prior × likelihood. P(class) is how common the class is overall; P(features | class) is how typical these features are for that class. The denominator P(features) is identical for every class, so for picking the winner it can be dropped.",
            },
            {
              kind: "heading",
              text: "The naive assumption",
            },
            {
              kind: "p",
              text: "Estimating P(features | class) jointly is hopeless — with thousands of features, no dataset covers the combinations. The **naive** move: assume every feature is **conditionally independent** of every other, given the class. Then the joint likelihood collapses into a product of per-feature probabilities, each estimable by simple counting.",
            },
            {
              kind: "formula",
              formula: "P(x₁, x₂, …, xₙ | class) = Π P(xᵢ | class)",
              explanation:
                "This is almost always false — in real spam, \"free\" and \"winner\" co-occur far more than independence predicts. The model is deliberately wrong in a way that stays computable.",
            },
            {
              kind: "p",
              text: "This is why **text classification** is the model's home turf. Represent a document as word counts, and P(word | class) is just: how often does this word appear in this class's training documents? Training a spam filter over a 50,000-word vocabulary reduces to counting words in two piles — one pass over the data, no iterative optimization, done in seconds.",
            },
            {
              kind: "code",
              caption: "A word-counting spam filter with Laplace smoothing.",
              code: "import math\nfrom collections import Counter\n\ndef train_nb(docs):  # docs: list of (list_of_words, label)\n    counts = {\"spam\": Counter(), \"ham\": Counter()}\n    doc_totals = Counter()\n    for words, label in docs:\n        counts[label].update(words)\n        doc_totals[label] += 1\n    vocab = set(counts[\"spam\"]) | set(counts[\"ham\"])\n    return counts, doc_totals, vocab\n\ndef score(words, label, counts, doc_totals, vocab):\n    n = sum(doc_totals.values())\n    total = sum(counts[label].values())\n    logp = math.log(doc_totals[label] / n)  # prior\n    for w in words:\n        # Laplace smoothing: +1 so unseen words never zero out.\n        p = (counts[label][w] + 1) / (total + len(vocab))\n        logp += math.log(p)\n    return logp  # classify by argmax over labels",
            },
            {
              kind: "heading",
              text: "Smoothing: the zero that kills",
            },
            {
              kind: "p",
              text: "Suppose the word \"blockchain\" never appeared in any training spam. Then P(blockchain | spam) = 0, and because the likelihood is a **product**, one zero annihilates everything — no email containing \"blockchain\" can ever be spam, regardless of the other 400 words screaming otherwise. One unseen word should not carry infinite evidence.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Laplace (add-one) smoothing",
              text: "Add 1 to every word count (and the vocabulary size to the denominator) before computing probabilities. Unseen words get a small positive probability instead of zero, so no single absence can veto the entire product. Generalizes to add-alpha for fractional pseudo-counts.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Wrong probabilities, right answers",
              text: "The independence assumption distorts the computed probabilities — they are usually far too confident. But classification only needs the argmax: the correct class merely has to outscore the others, and the ranking survives the distortion remarkably often. Trust naive Bayes' decisions before you trust its probabilities.",
            },
            {
              kind: "table",
              headers: ["Variant", "Feature type", "Typical use"],
              rows: [
                ["Multinomial", "Counts", "Word counts in documents"],
                ["Bernoulli", "Binary present/absent", "Short texts, indicator features"],
                ["Gaussian", "Continuous", "Numeric features, modeled per-class as normal"],
                ["Categorical", "Discrete categories", "Tabular categorical data"],
              ],
            },
            {
              kind: "p",
              text: "Naive Bayes trains in one pass, updates online by just incrementing counts, and handles enormous vocabularies without breaking a sweat. It rarely wins benchmarks outright anymore, but as a first model for any text problem it delivers a strong, honest baseline in minutes — which is exactly what a baseline is for.",
            },
          ],
          quiz: [
            {
              id: "nb-1",
              prompt: "In Bayes' rule as used by the classifier, P(features | class) is called the:",
              options: [
                "Posterior",
                "Likelihood",
                "Prior",
                "Evidence",
              ],
              answer: 1,
              explanation:
                "P(features | class) is the likelihood — how typical these features are for that class. P(class) is the prior, P(class | features) is the posterior being sought, and P(features) is the evidence, dropped because it is the same for all classes.",
            },
            {
              id: "nb-2",
              prompt: "What exactly does the 'naive' assumption state?",
              options: [
                "All classes are equally likely a priori",
                "Features are independent of each other, conditional on the class",
                "The training data contains no noise",
                "Every feature follows a normal distribution",
              ],
              answer: 1,
              explanation:
                "Given the class, each feature is assumed independent of the rest, so the joint likelihood factorizes into a product of per-feature terms. It is naive because real features (like co-occurring words) plainly violate it — yet the factorization is what makes the model tractable.",
            },
            {
              id: "nb-3",
              prompt: "Without smoothing, a word never seen in training spam causes:",
              options: [
                "A slightly lower spam score",
                "The entire spam likelihood to become zero, vetoing all other evidence",
                "The word to be skipped automatically",
                "An error during training",
              ],
              answer: 1,
              explanation:
                "The likelihood is a product of per-word probabilities; a single zero factor makes the whole product zero. One unseen word would outweigh any amount of contrary evidence — the zero-frequency problem that Laplace smoothing exists to fix.",
            },
            {
              id: "nb-4",
              prompt: "Laplace smoothing works by:",
              options: [
                "Removing rare words from the vocabulary",
                "Adding one to every count so unseen events get a small nonzero probability",
                "Averaging the probabilities of neighboring words",
                "Training on additional synthetic documents",
              ],
              answer: 1,
              explanation:
                "Adding a pseudo-count of 1 to every word (and vocabulary size to the denominator) guarantees every probability is positive. Unseen words then nudge the score instead of annihilating it.",
            },
            {
              id: "nb-5",
              prompt: "Why does naive Bayes often classify well even though its independence assumption is false?",
              options: [
                "The assumption is actually true for text",
                "Classification needs only the correct argmax, and the class ranking often survives the distorted probabilities",
                "Smoothing corrects the independence violations",
                "It ignores features that are correlated",
              ],
              answer: 1,
              explanation:
                "Violating independence skews the probability values — typically toward overconfidence — but the decision only requires the true class to score highest. That ordering is much more robust than the calibrated values, so decisions stay good while probabilities do not.",
            },
          ],
          practice: [
            { slug: "gaussian-naive-bayes", title: "Gaussian Naive Bayes Classifier", difficulty: "Medium" },
            { slug: "multinomial-naive-bayes", title: "Multinomial Naive Bayes for Text", difficulty: "Medium" },
            { slug: "categorical-naive-bayes", title: "Categorical Naive Bayes with Laplace Smoothing", difficulty: "Medium" },
          ],
        },
        {
          slug: "svm-intuition",
          title: "Support Vector Machines: The Intuition",
          minutes: 15,
          objectives: [
            "Explain margin maximization as a principled way to pick among separating boundaries",
            "Identify support vectors and their special role",
            "Describe the kernel trick at the concept level",
          ],
          blocks: [
            {
              kind: "p",
              text: "When two classes are separable, infinitely many boundaries separate them — a line hugging the positive class, one hugging the negative class, everything in between. All score identically on training data. The SVM's founding question: **which one should we prefer, and why?**",
            },
            {
              kind: "p",
              text: "Its answer: the boundary with the widest **margin** — the largest empty corridor between the boundary and the nearest training point of either class. A wide margin is a safety buffer. New examples land near their class's training examples but jittered by noise; a boundary that nearly grazes training points gets crossed by small jitter, while a maximally distant one absorbs it. Margin maximization is generalization pursued geometrically.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Support vectors",
              text: "The training points that lie exactly on the margin's edges (or violate it, in the soft-margin case). They alone determine the boundary — every other point could be deleted without moving it. The model is literally supported by these few critical examples, hence the name.",
            },
            {
              kind: "formula",
              formula: "margin width = 2 / ‖w‖",
              explanation:
                "For a boundary w·x + b = 0 with the nearest points at w·x + b = ±1, the corridor's width is 2/‖w‖. Maximizing the margin therefore means minimizing ‖w‖ — a clean convex optimization with a single global optimum.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Most of the data does not matter",
              text: "A logistic regression boundary shifts if you add easy points deep inside a class's territory; an SVM's does not — points beyond the margin have exactly zero influence. Sparsity in examples (only support vectors matter) is the SVM's signature, and it is also why predictions need only be compared against the support vectors, not the whole training set.",
            },
            {
              kind: "heading",
              text: "Soft margins: tolerating the messy real world",
            },
            {
              kind: "p",
              text: "Real classes overlap — no corridor is perfectly empty. The **soft-margin** SVM allows violations but charges for them, balancing margin width against violation cost with a constant C. Large C says violations are expensive: fit tightly, risk overfitting. Small C says keep the margin wide even if some points end up on the wrong side: more bias, less variance. C is the SVM's regularization dial, tuned by validation like lambda and k before it.",
            },
            {
              kind: "code",
              caption: "Hinge loss — the per-point price the soft margin charges.",
              code: "def hinge_loss(y, score):\n    # y is +1 or -1; score = w.x + b\n    return max(0.0, 1.0 - y * score)\n\n# score correct and beyond the margin (y*score >= 1): loss 0\n# inside the margin or misclassified: loss grows linearly\n# Points with zero loss exert zero pull on the boundary --\n# exactly why only support vectors matter.",
            },
            {
              kind: "heading",
              text: "The kernel trick, at concept level",
            },
            {
              kind: "p",
              text: "Some classes are not linearly separable in the original features — picture one class forming a ring around the other. But add the feature x₁² + x₂² (distance from center) and a flat plane separates them in the enlarged space. General principle: **data that is tangled in few dimensions can become linearly separable in more**. The catch is cost — useful expansions can be enormous or infinite-dimensional.",
            },
            {
              kind: "p",
              text: "Here is the trick: the SVM's math touches data **only through dot products** between pairs of points. A **kernel function** computes the dot product *as if* both points had been mapped into the enlarged space — directly from the original coordinates, without ever constructing the mapped vectors. You get a curved boundary in the original space that is secretly a flat, maximum-margin boundary in a space you never materialized.",
            },
            {
              kind: "table",
              headers: ["Kernel", "Implicit space", "Boundary shape in original space"],
              rows: [
                ["Linear", "The original features", "Straight hyperplane"],
                ["Polynomial (degree d)", "All feature products up to degree d", "Curved, polynomial"],
                ["RBF (Gaussian)", "Infinite-dimensional", "Smooth, arbitrarily flexible"],
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Practical footnotes",
              text: "SVMs compute distances-like quantities, so scale features first — same rule as kNN. The RBF kernel's width and C interact and both need tuning. And because kernel methods compare pairs of points, training cost grows steeply with dataset size: SVMs shine on small-to-medium datasets with complex boundaries, while boosted trees or networks take over at scale.",
            },
          ],
          quiz: [
            {
              id: "svm-1",
              prompt: "Among the many boundaries that separate the training classes perfectly, why does the SVM choose the maximum-margin one?",
              options: [
                "It is the fastest boundary to compute",
                "The widest buffer around the boundary best absorbs the noise in future examples",
                "It always passes through the origin",
                "It minimizes the number of features used",
              ],
              answer: 1,
              explanation:
                "All separating boundaries tie on training accuracy, so the choice must come from generalization reasoning: new points resemble training points plus jitter, and the boundary farthest from all training points is the one small jitter cannot cross.",
            },
            {
              id: "svm-2",
              prompt: "What happens to the SVM's boundary if you delete a training point that is far outside the margin?",
              options: [
                "The boundary shifts toward the deleted point",
                "Nothing — only support vectors on or inside the margin determine the boundary",
                "The margin doubles",
                "The model must be retrained from scratch with a new kernel",
              ],
              answer: 1,
              explanation:
                "Points beyond the margin have zero hinge loss and zero influence; the solution is supported entirely by the margin-defining points. This sparsity is the defining structural property of the SVM.",
            },
            {
              id: "svm-3",
              prompt: "In the soft-margin SVM, choosing a very large C means:",
              options: [
                "The margin is kept wide at any cost",
                "Margin violations are heavily penalized — the fit is tighter and overfitting risk rises",
                "All points become support vectors",
                "The kernel becomes linear",
              ],
              answer: 1,
              explanation:
                "C prices violations against margin width. Large C makes violations expensive, pushing the boundary to accommodate individual points — lower bias, higher variance. Small C tolerates violations to keep the corridor wide. It is a regularization dial.",
            },
            {
              id: "svm-4",
              prompt: "The kernel trick lets an SVM:",
              options: [
                "Train without any labeled data",
                "Compute dot products in a high-dimensional feature space without ever constructing the mapped vectors",
                "Reduce the number of features before training",
                "Avoid needing a decision boundary",
              ],
              answer: 1,
              explanation:
                "The SVM's optimization touches data only through pairwise dot products. A kernel evaluates those dot products as if the points lived in an enlarged space, directly from original coordinates — flexible boundaries without the cost of building the space.",
            },
            {
              id: "svm-5",
              prompt: "One class forms a ring around the other in 2D. Why does adding the feature x₁² + x₂² make them linearly separable?",
              options: [
                "It removes the outer ring from the data",
                "That feature encodes distance from the center, so a single threshold on it — a flat plane in 3D — splits ring from core",
                "Squared features always improve any model",
                "It reduces the data to one dimension",
              ],
              answer: 1,
              explanation:
                "The classes differ precisely in radius. In the lifted space (x₁, x₂, x₁² + x₂²), the ring sits high on the new axis and the core sits low, so a horizontal plane separates them — a linear boundary in the new space that looks like a circle in the original.",
            },
          ],
          practice: [
            { slug: "hinge-loss-eval", title: "Hinge and Squared Hinge Loss", difficulty: "Medium" },
            { slug: "svm-hinge-loss-gd", title: "Linear SVM via Subgradient Descent", difficulty: "Medium" },
            { slug: "perceptron-algorithm", title: "The Perceptron Learning Algorithm", difficulty: "Medium" },
          ],
        },
      ],
    },
  ],
};
