import type { Course } from "../types";

export const modelEvaluation: Course = {
  slug: "model-evaluation",
  title: "Model Evaluation & Validation",
  tagline: "Measure what matters, and measure it honestly",
  level: "Intermediate",
  accent: "from-amber-500 to-orange-600",
  description:
    "A model is only as good as the number you judge it by. Learn to pick the right metric for classifiers and regressors, read curves instead of single scores, and design validation schemes that cannot lie to you.",
  modules: [
    {
      slug: "classification-metrics",
      title: "Judging Classifiers",
      description:
        "From the confusion matrix to calibrated probabilities — what classifier scores actually mean.",
      lessons: [
        {
          slug: "confusion-matrix-accuracy",
          title: "The Confusion Matrix and Accuracy's Limits",
          minutes: 13,
          objectives: [
            "Read a confusion matrix and name its four cells",
            "Compute accuracy from the matrix",
            "Explain why accuracy misleads on imbalanced data",
          ],
          blocks: [
            {
              kind: "p",
              text: "Every classification metric you will ever use is computed from one table. For a binary classifier, compare each prediction to the truth and every example lands in exactly one of four cells — the **confusion matrix**. Learn to read it fluently and the rest of this module becomes arithmetic.",
            },
            {
              kind: "table",
              headers: ["", "Predicted positive", "Predicted negative"],
              rows: [
                ["Actually positive", "True Positive (TP)", "False Negative (FN)"],
                ["Actually negative", "False Positive (FP)", "True Negative (TN)"],
              ],
            },
            {
              kind: "callout",
              tone: "definition",
              title: "The four outcomes",
              text: "TP: correctly caught a positive. TN: correctly passed on a negative. FP: false alarm — predicted positive, was negative. FN: a miss — predicted negative, was positive. The two error types (FP and FN) usually carry very different real-world costs.",
            },
            {
              kind: "formula",
              formula: "Accuracy = (TP + TN) / (TP + TN + FP + FN)",
              explanation:
                "The fraction of all predictions that were correct — both cells on the matrix diagonal over the total.",
            },
            {
              kind: "code",
              caption: "Building the matrix and accuracy from raw labels.",
              code: "def confusion_counts(y_true, y_pred):\n    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)\n    tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)\n    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)\n    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)\n    return tp, tn, fp, fn\n\ndef accuracy(y_true, y_pred):\n    tp, tn, fp, fn = confusion_counts(y_true, y_pred)\n    return (tp + tn) / (tp + tn + fp + fn)",
            },
            {
              kind: "heading",
              text: "Where accuracy breaks",
            },
            {
              kind: "p",
              text: "Accuracy treats every correct prediction as equally valuable and every error as equally bad. Both assumptions collapse under **class imbalance**. Screen 1,000 patients where 10 have a disease: a classifier that says \"healthy\" to everyone scores 99% accuracy while missing every single sick patient. The number looks superb; the model is useless.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Accuracy on imbalanced data",
              text: "When one class dominates, accuracy is mostly measuring the class ratio, not the model. Always compare against the majority-class baseline, and reach for per-class metrics — precision, recall, balanced accuracy — before trusting any headline number.",
            },
            {
              kind: "p",
              text: "A quick fix worth knowing: **balanced accuracy** averages the accuracy on each class separately — the recall of the positive class and the recall of the negative class. The say-healthy-to-everyone model scores 50% balanced accuracy (100% on negatives, 0% on positives), exposing it as a coin flip.",
            },
            {
              kind: "p",
              text: "Multi-class problems generalize the matrix to one row and column per class: the diagonal holds correct predictions, and every off-diagonal cell tells you which class is being mistaken for which — often the most actionable diagnostic in the entire evaluation.",
            },
          ],
          quiz: [
            {
              id: "cm-1",
              prompt: "A spam filter marks a legitimate email as spam. Which cell of the confusion matrix is this?",
              options: [
                "True positive",
                "False positive",
                "True negative",
                "False negative",
              ],
              answer: 1,
              explanation:
                "The email is actually negative (not spam) but was predicted positive (spam) — a false positive, or false alarm. A false negative would be spam slipping into the inbox.",
            },
            {
              id: "cm-2",
              prompt: "With TP=40, TN=50, FP=5, FN=5, what is the accuracy?",
              options: ["80%", "85%", "90%", "95%"],
              answer: 2,
              explanation:
                "Accuracy = (TP + TN) / total = (40 + 50) / (40 + 50 + 5 + 5) = 90/100 = 90%.",
            },
            {
              id: "cm-3",
              prompt: "On a dataset with 1% positive examples, a model that always predicts negative scores about 99% accuracy. What does this show?",
              options: [
                "The model has learned the pattern well",
                "Accuracy mostly reflects the class ratio, not model skill, under imbalance",
                "The dataset must be corrupted",
                "Accuracy cannot be computed on imbalanced data",
              ],
              answer: 1,
              explanation:
                "The 99% is entirely the class ratio: the model detects nothing yet matches the majority baseline. High accuracy under imbalance says little about the model until you compare against that baseline.",
            },
            {
              id: "cm-4",
              prompt: "Why is balanced accuracy more informative than plain accuracy on imbalanced data?",
              options: [
                "It weights recent examples more heavily",
                "It averages per-class recall, so ignoring the rare class is punished",
                "It removes the negative class from the computation",
                "It is always higher than plain accuracy",
              ],
              answer: 1,
              explanation:
                "Balanced accuracy averages the recall of each class. A model that never predicts the rare class gets 0% on that class, dragging the average to 50% — the failure accuracy hides.",
            },
            {
              id: "cm-5",
              prompt: "In a multi-class confusion matrix, what do off-diagonal cells tell you?",
              options: [
                "The number of correct predictions per class",
                "Which classes are being confused with which — the structure of the errors",
                "The training time per class",
                "Nothing useful; only the diagonal matters",
              ],
              answer: 1,
              explanation:
                "Cell (i, j) counts examples of class i predicted as class j. Off-diagonal mass shows exactly which class pairs the model mixes up — often the most actionable evaluation output.",
            },
          ],
          practice: [
            { slug: "confusion-matrix", title: "Build a Confusion Matrix", difficulty: "Easy" },
            { slug: "accuracy-score", title: "Multiclass Accuracy", difficulty: "Easy" },
            { slug: "balanced-accuracy", title: "Balanced Accuracy", difficulty: "Easy" },
            { slug: "specificity-and-npv", title: "Specificity and Negative Predictive Value", difficulty: "Easy" },
          ],
        },
        {
          slug: "precision-recall-f1",
          title: "Precision, Recall, and F1",
          minutes: 14,
          objectives: [
            "Define precision and recall from confusion-matrix cells",
            "Explain the precision-recall trade-off and when to favor each",
            "Use F1 and F-beta, and distinguish macro from micro averaging",
          ],
          blocks: [
            {
              kind: "p",
              text: "Accuracy asks one question about all predictions at once. Precision and recall split it into the two questions you actually care about. **Precision**: of everything the model flagged positive, how much really was? **Recall**: of everything truly positive, how much did the model catch?",
            },
            {
              kind: "formula",
              formula: "Precision = TP / (TP + FP)    Recall = TP / (TP + FN)",
              explanation:
                "Same numerator, different denominators: precision divides by predicted positives (penalizing false alarms), recall divides by actual positives (penalizing misses).",
            },
            {
              kind: "p",
              text: "The two pull against each other. Flag more aggressively and recall rises — you catch more positives — but precision falls as false alarms pile in. Flag conservatively and precision rises while recall falls. Which side to favor is a **product decision**, not a math one: cancer screening favors recall (a miss can be fatal, a false alarm costs a follow-up test); spam filtering favors precision (a lost legitimate email hurts more than one spam getting through).",
            },
            {
              kind: "heading",
              text: "F1: one number for the pair",
            },
            {
              kind: "formula",
              formula: "F1 = 2 · (Precision · Recall) / (Precision + Recall)",
              explanation:
                "The harmonic mean. Unlike the arithmetic mean, it collapses toward the worse of the two — a model cannot buy a high F1 by maxing one and abandoning the other.",
            },
            {
              kind: "p",
              text: "When the costs are asymmetric but you still want one number, **F-beta** generalizes F1: beta > 1 weights recall more (F2 is common in medical screening), beta < 1 weights precision more (F0.5 suits spam filtering). F1 is just the beta = 1 case.",
            },
            {
              kind: "code",
              caption: "Precision, recall, and F-beta from counts.",
              code: "def precision_recall_fbeta(tp, fp, fn, beta=1.0):\n    precision = tp / (tp + fp) if tp + fp else 0.0\n    recall = tp / (tp + fn) if tp + fn else 0.0\n    if precision + recall == 0:\n        return precision, recall, 0.0\n    b2 = beta * beta\n    fbeta = (1 + b2) * precision * recall / (b2 * precision + recall)\n    return precision, recall, fbeta",
            },
            {
              kind: "heading",
              text: "Macro vs micro averaging",
            },
            {
              kind: "p",
              text: "With more than two classes, each class gets its own precision/recall/F1 — and then you must average. **Macro** averaging computes the metric per class and takes the plain mean: every class counts equally, so a collapse on a rare class drags the score down hard. **Micro** averaging pools all TP/FP/FN counts first and computes once: every example counts equally, so frequent classes dominate.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Which average to report",
              text: "If rare classes matter — rare diseases, rare fraud types — report macro, because it refuses to let the common classes paper over failure on the rare ones. Micro F1 on single-label multi-class problems equals accuracy, so it adds nothing new there.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "State the positive class",
              text: "Precision and recall are defined relative to which class you call positive. Swap the positive class and both numbers change. Any reported precision/recall without a stated positive class is ambiguous.",
            },
          ],
          quiz: [
            {
              id: "prf-1",
              prompt: "A model flags 50 transactions as fraud; 40 really are fraud. There were 80 fraud cases in total. Precision and recall?",
              options: [
                "Precision 80%, recall 50%",
                "Precision 50%, recall 80%",
                "Precision 40%, recall 40%",
                "Precision 80%, recall 80%",
              ],
              answer: 0,
              explanation:
                "Precision = 40/50 = 80% (of flagged, how many real). Recall = 40/80 = 50% (of real fraud, how much caught).",
            },
            {
              id: "prf-2",
              prompt: "For a cancer screening test where missing a case is far worse than a false alarm, which metric deserves priority?",
              options: ["Precision", "Recall", "Accuracy", "Specificity"],
              answer: 1,
              explanation:
                "A missed cancer (false negative) can be fatal; a false alarm costs a follow-up test. Recall directly measures how few positives are missed, so it takes priority — often via an F2 score.",
            },
            {
              id: "prf-3",
              prompt: "Why does F1 use the harmonic mean instead of the arithmetic mean?",
              options: [
                "It is faster to compute",
                "The harmonic mean stays low unless BOTH precision and recall are high",
                "It always gives higher scores",
                "It works on non-numeric data",
              ],
              answer: 1,
              explanation:
                "The arithmetic mean of precision 1.0 and recall 0.01 is a flattering 0.505; the harmonic mean is about 0.02. F1 collapses toward the weaker number, so neither can be sacrificed.",
            },
            {
              id: "prf-4",
              prompt: "In F-beta, choosing beta = 2 means:",
              options: [
                "Precision is weighted twice as much as recall",
                "Recall is weighted more heavily than precision",
                "The score is doubled",
                "Both metrics are ignored",
              ],
              answer: 1,
              explanation:
                "Beta > 1 shifts weight toward recall (F2 is standard when misses are costly); beta < 1 shifts toward precision. F1 is the balanced beta = 1 case.",
            },
            {
              id: "prf-5",
              prompt: "A 10-class model performs well on 9 frequent classes and terribly on 1 rare class. Which average exposes this?",
              options: [
                "Micro F1, because it pools all counts",
                "Macro F1, because every class contributes equally to the mean",
                "Accuracy",
                "Neither — averages always hide it",
              ],
              answer: 1,
              explanation:
                "Macro averages the per-class scores, so the rare class's near-zero F1 drags the macro score down by a full tenth. Micro pools counts, letting the 9 frequent classes swamp the failure.",
            },
          ],
          practice: [
            { slug: "precision-recall", title: "Precision and Recall", difficulty: "Easy" },
            { slug: "compute-f1-score", title: "Compute F1 Score from Scratch", difficulty: "Easy" },
            { slug: "fbeta-score", title: "F-Beta Score", difficulty: "Medium" },
            { slug: "macro-micro-f1", title: "Macro and Micro F1 for Multiclass", difficulty: "Medium" },
          ],
        },
        {
          slug: "roc-pr-curves",
          title: "ROC and Precision-Recall Curves",
          minutes: 15,
          objectives: [
            "Explain how sweeping a threshold turns scores into a curve",
            "Interpret ROC AUC as a ranking probability",
            "Decide when a PR curve is more informative than ROC",
          ],
          blocks: [
            {
              kind: "p",
              text: "Most classifiers do not output labels — they output **scores**, and a threshold turns scores into labels. Every metric so far was computed at one fixed threshold. Curves ask the better question: how does the model perform across **all** thresholds? That evaluates the model's ranking ability, separate from any particular cutoff choice.",
            },
            {
              kind: "heading",
              text: "The ROC curve",
            },
            {
              kind: "p",
              text: "Sweep the threshold from strict to lenient and plot, at each setting, the **true positive rate** (recall: TP / (TP + FN)) against the **false positive rate** (FP / (FP + TN)). A perfect model hugs the top-left corner — all positives caught before any false alarm. A random model traces the diagonal. Real models arc somewhere between.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "ROC AUC",
              text: "The area under the ROC curve, from 0 to 1. It has a clean probabilistic meaning: AUC is the probability that a randomly chosen positive example receives a higher score than a randomly chosen negative example. 1.0 is perfect ranking, 0.5 is random, and below 0.5 means the model ranks backwards.",
            },
            {
              kind: "code",
              caption: "AUC computed directly from its ranking definition.",
              code: "def roc_auc(y_true, scores):\n    pairs = correct = 0.0\n    pos = [s for s, t in zip(scores, y_true) if t == 1]\n    neg = [s for s, t in zip(scores, y_true) if t == 0]\n    for p in pos:\n        for n in neg:\n            pairs += 1\n            if p > n:\n                correct += 1\n            elif p == n:\n                correct += 0.5  # ties count half\n    return correct / pairs\n\n# O(n^2) for clarity; production code sorts once instead.",
            },
            {
              kind: "p",
              text: "Because AUC is about ranking, it is **threshold-free**: two teams using different cutoffs still agree on AUC. This makes it a good model-comparison metric during development, before the deployment threshold is even chosen.",
            },
            {
              kind: "heading",
              text: "When ROC flatters: enter the PR curve",
            },
            {
              kind: "p",
              text: "The ROC's false positive rate has all the negatives in its denominator. With 1,000,000 negatives and 100 positives, even 10,000 false alarms is an FPR of just 1% — the ROC curve barely flinches while precision has collapsed to under 1%. The **precision-recall curve** plots precision against recall across thresholds, and neither axis touches the true-negative count, so the rare-positive picture stays honest.",
            },
            {
              kind: "table",
              headers: ["Situation", "Prefer", "Why"],
              rows: [
                [
                  "Roughly balanced classes",
                  "ROC / AUC",
                  "Both error rates visible; AUC comparable across datasets",
                ],
                [
                  "Rare positive class",
                  "PR curve / average precision",
                  "TN volume cannot inflate the picture; tracks the flagged set's quality",
                ],
                [
                  "You care about the flagged set (alerts, retrieved results)",
                  "PR curve",
                  "Precision is exactly the quality of what you surface",
                ],
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "The PR baseline moves",
              text: "A random classifier's PR curve sits at precision = the positive rate — 0.5 on balanced data, 0.001 when positives are 0.1%. Unlike ROC's fixed 0.5 diagonal, PR scores are not comparable across datasets with different class ratios without noting that baseline.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Curves rank, thresholds decide",
              text: "Use curves and their areas to choose between models. Then, for the winning model, choose the operating threshold from the actual costs of FP vs FN — the subject of the next lesson.",
            },
          ],
          quiz: [
            {
              id: "roc-1",
              prompt: "What does sweeping the classification threshold produce?",
              options: [
                "A retrained model for each threshold",
                "One (FPR, TPR) or (recall, precision) point per threshold, tracing a curve",
                "A larger training set",
                "A calibrated probability output",
              ],
              answer: 1,
              explanation:
                "The model and its scores stay fixed; only the cutoff moves. Each cutoff yields one confusion matrix, hence one point — the curve is the set of all operating points.",
            },
            {
              id: "roc-2",
              prompt: "ROC AUC = 0.90 means:",
              options: [
                "The model is correct 90% of the time",
                "A random positive outranks a random negative with probability 0.90",
                "Precision is 90% at the default threshold",
                "90% of thresholds give perfect predictions",
              ],
              answer: 1,
              explanation:
                "AUC is a ranking probability: pick one positive and one negative at random, and 90% of the time the positive gets the higher score. It says nothing directly about accuracy or precision at any threshold.",
            },
            {
              id: "roc-3",
              prompt: "An ROC curve exactly on the diagonal indicates:",
              options: [
                "A perfect classifier",
                "A classifier whose ranking is no better than random",
                "A classifier with high precision",
                "An error in the plotting code",
              ],
              answer: 1,
              explanation:
                "On the diagonal, TPR equals FPR at every threshold — positives and negatives are interleaved at random in the score ordering. AUC is 0.5.",
            },
            {
              id: "roc-4",
              prompt: "Why can ROC look excellent while the model is nearly useless on a rare-positive problem?",
              options: [
                "ROC cannot be computed with few positives",
                "FPR divides by the huge negative count, so even many false alarms barely move the curve",
                "AUC is capped at 0.5 for rare classes",
                "Recall is undefined for rare classes",
              ],
              answer: 1,
              explanation:
                "With a million negatives, 10,000 false alarms is only 1% FPR — invisible on the ROC — while precision among the flagged set collapses. The PR curve, which never touches the TN count, exposes it.",
            },
            {
              id: "roc-5",
              prompt: "A random classifier's baseline on the PR curve is:",
              options: [
                "Always 0.5, like ROC",
                "Precision equal to the dataset's positive-class rate",
                "Always zero",
                "Equal to the model's recall",
              ],
              answer: 1,
              explanation:
                "Flagging at random yields precision equal to the prevalence of positives. That moving baseline is why PR scores must be read against the class ratio, unlike ROC's fixed 0.5 diagonal.",
            },
          ],
          practice: [
            { slug: "roc-curve-points", title: "Compute the ROC Curve", difficulty: "Medium" },
            { slug: "roc-auc-score", title: "ROC AUC from Prediction Scores", difficulty: "Medium" },
            { slug: "lift-at-k", title: "Lift at K", difficulty: "Easy" },
          ],
        },
        {
          slug: "calibration-log-loss",
          title: "Calibration, Log Loss, and Choosing a Threshold",
          minutes: 14,
          objectives: [
            "Distinguish evaluating probabilities from evaluating labels",
            "Interpret log loss and the Brier score",
            "Pick a decision threshold from misclassification costs",
          ],
          blocks: [
            {
              kind: "p",
              text: "Everything so far scored **labels**. But many systems consume the probability itself: a bank prices risk by the default probability, a triage system routes by the severity probability. When the number is the product, you must evaluate the number — and a model whose \"0.9\" events happen 60% of the time is broken no matter how good its ranking is.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Calibration",
              text: "A model is calibrated when its predicted probabilities match observed frequencies: among all predictions of 0.7, about 70% should actually be positive. Calibration is separate from discrimination (ranking) — a model can have excellent AUC and terrible calibration, or vice versa.",
            },
            {
              kind: "formula",
              formula: "Log loss = -mean( y·log(p) + (1-y)·log(1-p) )",
              explanation:
                "For each example, the penalty is -log of the probability assigned to the true class. Confident correct predictions cost almost nothing; confident wrong ones cost enormously.",
            },
            {
              kind: "p",
              text: "Log loss is the workhorse for probability quality. Its signature property is **punishing confident mistakes**: predicting 0.99 for a negative example costs -log(0.01) ≈ 4.6, versus about 0.69 for a maximally hedged 0.5. A model minimizing log loss learns to be honest about its uncertainty — bluffing is expensive.",
            },
            {
              kind: "code",
              caption: "Log loss and Brier score, with clipping to avoid log(0).",
              code: "import math\n\ndef log_loss(y_true, p_pred, eps=1e-15):\n    total = 0.0\n    for y, p in zip(y_true, p_pred):\n        p = min(max(p, eps), 1 - eps)  # never log(0)\n        total += -(y * math.log(p) + (1 - y) * math.log(1 - p))\n    return total / len(y_true)\n\ndef brier_score(y_true, p_pred):\n    return sum((p - y) ** 2 for y, p in zip(y_true, p_pred)) / len(y_true)",
            },
            {
              kind: "p",
              text: "The **Brier score** is the gentler alternative: the mean squared error between predicted probability and the 0/1 outcome. It rewards calibration like log loss does, but a confident mistake costs at most 1.0 rather than exploding — useful when a few outliers should not dominate the evaluation. For both metrics, lower is better.",
            },
            {
              kind: "heading",
              text: "From probabilities to decisions: the cost-based threshold",
            },
            {
              kind: "p",
              text: "The default threshold of 0.5 silently assumes false positives and false negatives cost the same. They almost never do. With calibrated probabilities, the right cutoff falls straight out of the costs: flag when the expected cost of missing exceeds the expected cost of a false alarm.",
            },
            {
              kind: "formula",
              formula: "threshold = C_FP / (C_FP + C_FN)",
              explanation:
                "Flag when p exceeds this. If a miss costs 9x a false alarm (C_FN = 9, C_FP = 1), flag at p > 0.1 — far below 0.5, because misses are what you cannot afford.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Why calibration unlocks thresholding",
              text: "The cost formula only works if p means what it says. This is the practical payoff of calibration: with honest probabilities, changing business costs is a threshold tweak — no retraining. With uncalibrated scores, the threshold must be re-tuned empirically every time.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "High AUC does not mean usable probabilities",
              text: "AUC is invariant to any monotonic squashing of scores — a model outputting everything in [0.49, 0.51] can still have AUC 0.95. Before treating outputs as probabilities, check calibration (log loss, Brier, or a reliability plot), and recalibrate if needed.",
            },
          ],
          quiz: [
            {
              id: "cal-1",
              prompt: "A model is well calibrated when:",
              options: [
                "Its accuracy exceeds 90%",
                "Among predictions of probability p, roughly a fraction p turn out positive",
                "Its AUC equals 1.0",
                "It never outputs probabilities near 0.5",
              ],
              answer: 1,
              explanation:
                "Calibration means the stated probabilities match observed frequencies — of all the 0.7 predictions, about 70% should be positive. It is a property of the probabilities, independent of ranking quality.",
            },
            {
              id: "cal-2",
              prompt: "Why does log loss penalize a confident wrong prediction so heavily?",
              options: [
                "It multiplies errors by the dataset size",
                "The penalty is -log of the probability given to the true class, which explodes as that probability approaches 0",
                "It counts each wrong prediction twice",
                "It is a bug in most implementations",
              ],
              answer: 1,
              explanation:
                "Predicting 0.99 for the wrong class gives the true class probability 0.01, and -log(0.01) ≈ 4.6 — dozens of times the cost of a hedged 0.5. This makes overconfidence expensive and honesty optimal.",
            },
            {
              id: "cal-3",
              prompt: "How does the Brier score differ from log loss?",
              options: [
                "It evaluates labels instead of probabilities",
                "It is squared error against the 0/1 outcome, so a single confident mistake costs at most 1 instead of exploding",
                "It only works for multi-class problems",
                "Higher Brier scores are better",
              ],
              answer: 1,
              explanation:
                "Brier = mean (p - y)^2, capped at 1 per example. It still rewards calibration but is robust to the rare confident blunder that would dominate log loss. Lower is better for both.",
            },
            {
              id: "cal-4",
              prompt: "A false negative costs 9 units and a false positive costs 1 unit. With calibrated probabilities, the optimal flagging threshold is:",
              options: ["0.5", "0.9", "0.1", "0.09"],
              answer: 2,
              explanation:
                "threshold = C_FP / (C_FP + C_FN) = 1/(1+9) = 0.1. Because misses are 9x costlier, you flag anything above 10% probability — the default 0.5 would silently accept far too many misses.",
            },
            {
              id: "cal-5",
              prompt: "Can a model have AUC 0.95 and badly miscalibrated probabilities?",
              options: [
                "No — high AUC implies calibration",
                "Yes — AUC only measures ranking, which survives any monotonic distortion of the scores",
                "Only for regression models",
                "Only if the dataset is balanced",
              ],
              answer: 1,
              explanation:
                "AUC depends only on the ordering of scores. Squash every score into [0.49, 0.51] and AUC is unchanged while the values are useless as probabilities. Calibration must be checked separately.",
            },
          ],
          practice: [
            { slug: "log-loss-metric", title: "Binary Log Loss", difficulty: "Easy" },
            { slug: "brier-score", title: "Brier Score", difficulty: "Easy" },
            { slug: "probability-thresholding", title: "Turn Probabilities into Labels", difficulty: "Easy" },
            { slug: "cost-sensitive-evaluation", title: "Cost-Sensitive Classification Evaluation", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      slug: "regression-metrics",
      title: "Judging Regressors",
      description:
        "Error metrics for numeric predictions — their units, their outlier behavior, and their traps.",
      lessons: [
        {
          slug: "mae-mse-rmse-r2",
          title: "MAE, MSE, RMSE, and R²",
          minutes: 14,
          objectives: [
            "Compute MAE, MSE, and RMSE and state their units",
            "Explain how squaring changes sensitivity to outliers",
            "Interpret R² correctly and name its pitfalls",
          ],
          blocks: [
            {
              kind: "p",
              text: "Regression errors are simple to state — prediction minus truth — but averaging them forces a choice with consequences. Average the absolute errors and you get **MAE**. Square before averaging and you get **MSE**; take the root to return to original units and you get **RMSE**. The squaring step is the entire personality difference.",
            },
            {
              kind: "formula",
              formula: "MAE = mean(|y - ŷ|)    MSE = mean((y - ŷ)²)    RMSE = √MSE",
              explanation:
                "MAE and RMSE are in the target's units (rupees, degrees, minutes); MSE is in squared units, which is why it is optimized more often than reported.",
            },
            {
              kind: "p",
              text: "Squaring makes large errors count disproportionately: one error of 10 contributes as much to MSE as a hundred errors of 1. So **RMSE is dragged upward by outliers** while MAE treats a 10-unit miss as exactly ten 1-unit misses. Neither is \"correct\" — they encode different beliefs about which errors hurt. If one delivery being 3 hours late is worse than six being 30 minutes late, RMSE reflects your reality; if not, MAE does.",
            },
            {
              kind: "code",
              caption: "All three metrics, and how one outlier splits them.",
              code: "import math\n\ndef mae(y, yhat):\n    return sum(abs(a - b) for a, b in zip(y, yhat)) / len(y)\n\ndef rmse(y, yhat):\n    return math.sqrt(sum((a - b) ** 2 for a, b in zip(y, yhat)) / len(y))\n\nerrors_even   = [2, 2, 2, 2]      # MAE 2.0, RMSE 2.0\nerrors_spiked = [0, 0, 0, 8]      # MAE 2.0, RMSE 4.0\n# Same MAE; the outlier doubles RMSE. The gap between the two\n# metrics is itself a diagnostic for error concentration.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Read the MAE-RMSE gap",
              text: "RMSE is always at least MAE. When they are close, errors are uniform in size. When RMSE is much larger, a few big misses dominate — go find them, because they are usually a data problem or a missing feature, not noise.",
            },
            {
              kind: "heading",
              text: "R²: error relative to a baseline",
            },
            {
              kind: "formula",
              formula: "R² = 1 - SS_res / SS_tot = 1 - MSE(model) / MSE(predict-the-mean)",
              explanation:
                "The fraction of the target's variance the model explains. R² = 0 means no better than predicting the mean; R² = 1 means perfect; negative means actively worse than the mean.",
            },
            {
              kind: "p",
              text: "R² answers the question raw errors cannot: is an RMSE of 12 good? It depends entirely on the target's spread — and R² bakes that comparison in by scoring against the predict-the-mean baseline. That makes it scale-free and comparable across problems in a way RMSE is not.",
            },
            {
              kind: "list",
              items: [
                "**R² can be negative** on held-out data: the model is worse than the mean baseline. This is common with leakage-free evaluation of a badly overfit model and is a signal, not a bug.",
                "**R² never decreases when you add features** on training data — even pure-noise features nudge it up. Judge feature additions on validation R² (or adjusted R²), never training R².",
                "**A high R² is not proof of a good model**: it can be inflated by outliers, a huge target variance, or leakage. Plot residuals before trusting it.",
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Do not compare R² across different targets",
              text: "R² is relative to each dataset's own variance. An R² of 0.6 on noisy financial returns may be spectacular; 0.9 on an easy physical process may be poor. Compare models on the same data with it — not problems against each other.",
            },
          ],
          quiz: [
            {
              id: "reg-1",
              prompt: "Which metric is in the same units as the target variable?",
              options: [
                "MSE only",
                "MAE and RMSE",
                "R² only",
                "None of them",
              ],
              answer: 1,
              explanation:
                "MAE averages absolute errors and RMSE takes the square root of MSE, so both land back in target units. MSE is in squared units; R² is unitless.",
            },
            {
              id: "reg-2",
              prompt: "Two models have identical MAE, but model B has much higher RMSE. What does this reveal?",
              options: [
                "Model B is better",
                "Model B's errors include a few large misses that squaring amplifies",
                "The metrics were computed incorrectly",
                "Model B has more parameters",
              ],
              answer: 1,
              explanation:
                "Squaring makes big errors dominate: equal MAE with higher RMSE means B's error mass is concentrated in outliers. The gap between MAE and RMSE measures error concentration.",
            },
            {
              id: "reg-3",
              prompt: "What does R² = 0 mean on a test set?",
              options: [
                "The model predicts perfectly",
                "The model's MSE equals that of always predicting the mean",
                "The model has zero parameters",
                "The test set is empty",
              ],
              answer: 1,
              explanation:
                "R² compares the model's squared error to the predict-the-mean baseline. Zero means no improvement over that baseline; negative means the model does worse than it.",
            },
            {
              id: "reg-4",
              prompt: "Why is training-set R² a poor guide when adding features?",
              options: [
                "R² cannot be computed during training",
                "Training R² never decreases with added features, even useless ones",
                "Features change the units of R²",
                "Training R² is always negative",
              ],
              answer: 1,
              explanation:
                "Any extra feature — even noise — gives the fit more freedom, so training R² can only stay flat or rise. Judge additions on validation R², where useless features stop helping.",
            },
            {
              id: "reg-5",
              prompt: "Delivery-time errors: six predictions off by 30 minutes vs one off by 3 hours. Which metric treats these two situations as equally bad?",
              options: ["RMSE", "MAE", "MSE", "R²"],
              answer: 1,
              explanation:
                "MAE is linear in error size: 6 × 30 min = 180 min = 1 × 180 min. The squared metrics (MSE, RMSE) rate the single 3-hour miss far worse. Pick the metric that matches which failure actually hurts more.",
            },
          ],
          practice: [
            { slug: "mse-mae-metrics", title: "MSE and MAE Regression Metrics", difficulty: "Easy" },
            { slug: "r2-score", title: "R-squared - Coefficient of Determination", difficulty: "Easy" },
          ],
        },
        {
          slug: "percentage-scale-free-errors",
          title: "Percentage and Scale-Free Errors",
          minutes: 13,
          objectives: [
            "Compute MAPE and SMAPE and know their failure modes",
            "Explain what RMSLE measures and when to use it",
            "Match each scale-free metric to the problem it fits",
          ],
          blocks: [
            {
              kind: "p",
              text: "An RMSE of 500 is disastrous for items priced near 1,000 and negligible for items priced near 1,000,000. When targets span scales — sales across products, prices across categories — absolute errors stop being comparable, and you need metrics that judge error **relative to the target's size**.",
            },
            {
              kind: "formula",
              formula: "MAPE = mean( |y - ŷ| / |y| ) × 100%",
              explanation:
                "Mean absolute percentage error: each error divided by the true value. \"Off by 8% on average\" — the phrasing every stakeholder understands instantly.",
            },
            {
              kind: "p",
              text: "MAPE's readability comes with three sharp edges. It is **undefined when y = 0** and explodes when y is near zero — one nearly-zero-demand day can dominate the whole average. It is **asymmetric**: an over-prediction can cost arbitrarily many percent, while an under-prediction is capped at 100%, so models tuned on MAPE learn to systematically under-forecast. And it is meaningless for targets where zero is arbitrary, like temperatures in Celsius.",
            },
            {
              kind: "formula",
              formula: "SMAPE = mean( |y - ŷ| / ((|y| + |ŷ|) / 2) ) × 100%",
              explanation:
                "Symmetric MAPE: the denominator averages the true and predicted magnitudes, bounding the metric (0-200%) and softening — not eliminating — the near-zero and asymmetry problems.",
            },
            {
              kind: "heading",
              text: "RMSLE: errors in ratio space",
            },
            {
              kind: "formula",
              formula: "RMSLE = √( mean( (log(1+y) - log(1+ŷ))² ) )",
              explanation:
                "RMSE applied to log(1 + value). Differences of logs are log-ratios, so RMSLE measures by what multiplicative factor predictions are off; log1p keeps zero targets legal.",
            },
            {
              kind: "p",
              text: "Because log differences are ratios, RMSLE treats predicting 1,000 for a true 2,000 exactly like predicting 100,000 for a true 200,000 — both are off by 2x. It also penalizes under-prediction more than over-prediction of the same absolute size, which suits demand forecasting where stockouts (under) cost more than overstock. This is why RMSLE is the standard for skewed, wide-range targets: sales volumes, house prices, ride counts.",
            },
            {
              kind: "code",
              caption: "All three, with MAPE guarding against zero targets.",
              code: "import math\n\ndef mape(y, yhat):\n    terms = [abs(a - b) / abs(a) for a, b in zip(y, yhat) if a != 0]\n    return 100 * sum(terms) / len(terms)\n\ndef smape(y, yhat):\n    terms = [abs(a - b) / ((abs(a) + abs(b)) / 2)\n             for a, b in zip(y, yhat) if abs(a) + abs(b) > 0]\n    return 100 * sum(terms) / len(terms)\n\ndef rmsle(y, yhat):\n    sq = [(math.log1p(a) - math.log1p(b)) ** 2 for a, b in zip(y, yhat)]\n    return math.sqrt(sum(sq) / len(sq))",
            },
            {
              kind: "table",
              headers: ["Metric", "Best when", "Watch out for"],
              rows: [
                [
                  "MAPE",
                  "Stakeholder reporting; targets safely far from zero",
                  "Undefined/explosive at y ≈ 0; rewards under-forecasting",
                ],
                [
                  "SMAPE",
                  "Comparing forecasts across series of different scales",
                  "Still unstable near zero; less intuitive to explain",
                ],
                [
                  "RMSLE",
                  "Skewed positive targets spanning orders of magnitude",
                  "Only for non-negative targets; ratio errors, not unit errors",
                ],
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Optimizing MAPE shapes the model",
              text: "A metric is also an incentive. Because over-predictions can cost unbounded percent while under-predictions cap at 100%, a model selected to minimize MAPE learns a low bias. If systematic under-forecasting is expensive for you — lost sales, stockouts — do not select models on MAPE.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Report a pair",
              text: "Scale-free and absolute metrics answer different questions, so report one of each: RMSLE + MAE tells you both the typical ratio miss and what it costs in real units. A single number always hides one of the two.",
            },
          ],
          quiz: [
            {
              id: "pct-1",
              prompt: "Why do absolute metrics like RMSE break down when comparing forecasts across products with very different sales volumes?",
              options: [
                "RMSE cannot be computed for multiple products",
                "The same absolute error means very different things at different target scales",
                "Sales data is always non-numeric",
                "RMSE requires balanced classes",
              ],
              answer: 1,
              explanation:
                "An error of 500 units is catastrophic for a product selling 1,000 and trivial for one selling 1,000,000. Relative metrics divide by the target's size so errors become comparable.",
            },
            {
              id: "pct-2",
              prompt: "What happens to MAPE when a true value is zero?",
              options: [
                "It equals zero for that example",
                "It is undefined — the term divides by |y| = 0",
                "It automatically switches to SMAPE",
                "Nothing; MAPE ignores the prediction",
              ],
              answer: 1,
              explanation:
                "MAPE divides each error by the true value, so y = 0 divides by zero, and y near zero produces exploding terms that can dominate the average. This is MAPE's central failure mode.",
            },
            {
              id: "pct-3",
              prompt: "Why does selecting models by MAPE encourage systematic under-forecasting?",
              options: [
                "MAPE ignores small predictions",
                "Under-predictions cost at most 100%, while over-predictions can cost unbounded percent",
                "MAPE is computed only on the largest values",
                "Under-forecasts are excluded from MAPE",
              ],
              answer: 1,
              explanation:
                "Predicting 0 for a true 100 is a 100% error; predicting 300 for a true 100 is 200%. The asymmetric penalty makes lowballing the safer strategy, biasing MAPE-optimized models downward.",
            },
            {
              id: "pct-4",
              prompt: "RMSLE treats predicting 1,000 for a true 2,000 the same as predicting 100,000 for a true 200,000 because:",
              options: [
                "It rounds all values to one significant figure",
                "Differences of logs are ratios, and both predictions are off by the same 2x factor",
                "It only looks at the sign of the error",
                "Both errors exceed its maximum penalty",
              ],
              answer: 1,
              explanation:
                "log(1+y) - log(1+ŷ) is approximately the log of the ratio y/ŷ. RMSLE lives in ratio space, so equal multiplicative misses are penalized equally regardless of absolute scale.",
            },
            {
              id: "pct-5",
              prompt: "For forecasting daily ride counts that range from 5 to 500,000 and are never negative, the most suitable metric is:",
              options: ["MAPE", "Plain RMSE", "RMSLE", "R² on raw counts"],
              answer: 2,
              explanation:
                "The target is non-negative, heavily skewed, and spans five orders of magnitude — exactly RMSLE's home ground. RMSE would be dominated by the biggest days; MAPE would explode on the near-zero ones.",
            },
          ],
          practice: [
            { slug: "mape-and-smape", title: "MAPE and SMAPE", difficulty: "Easy" },
            { slug: "rmse-and-rmsle", title: "RMSE and RMSLE", difficulty: "Easy" },
          ],
        },
      ],
    },
    {
      slug: "validation",
      title: "Honest Validation",
      description:
        "Estimating real-world performance without fooling yourself — resampling, imbalance, and tuning hygiene.",
      lessons: [
        {
          slug: "cross-validation",
          title: "Cross-Validation",
          minutes: 15,
          objectives: [
            "Run k-fold cross-validation and explain what it estimates",
            "Choose between k-fold, stratified k-fold, and leave-one-out",
            "Apply forward-chaining validation to time-series data",
          ],
          blocks: [
            {
              kind: "p",
              text: "A single train/test split gives you one number — and that number depends on which examples happened to land in the test set. On small or medium datasets, re-splitting with a different seed can swing the score by several points. **Cross-validation** replaces the one lucky (or unlucky) number with an average over many splits.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "K-fold cross-validation",
              text: "Partition the data into k equal folds. Train k times, each time holding out a different fold as the test set and training on the other k-1. The k scores are averaged — and their spread estimates how much the score varies with the data split.",
            },
            {
              kind: "code",
              caption: "Generating k-fold index splits with stdlib only.",
              code: "import random\n\ndef kfold_indices(n, k, seed=42):\n    idx = list(range(n))\n    random.Random(seed).shuffle(idx)\n    folds = [idx[i::k] for i in range(k)]\n    for i in range(k):\n        test = folds[i]\n        train = [j for f in folds[:i] + folds[i + 1:] for j in f]\n        yield train, test\n\n# Every example is tested exactly once and trained on k-1 times.",
            },
            {
              kind: "p",
              text: "Report the **mean and the spread** of the k scores, not just the mean. Two models with means 0.84 and 0.85 are indistinguishable if their fold scores swing by ±0.03 — the spread is what tells you whether a difference is real or split luck.",
            },
            {
              kind: "heading",
              text: "Choosing k, and the variants",
            },
            {
              kind: "list",
              items: [
                "**k = 5 or 10** is the standard trade-off: enough folds for a stable average, few enough that training k models stays affordable.",
                "**Stratified k-fold** preserves class proportions in every fold. For imbalanced classification it is the default, not an option — plain k-fold can produce folds with almost none of the rare class, making those folds' scores meaningless.",
                "**Leave-one-out (LOO)** is k = n: each example is its own test set. It uses the most training data per fit but costs n model trainings — prohibitive beyond small datasets — and its estimates tend to have high variance. Reserve it for very small data.",
              ],
            },
            {
              kind: "heading",
              text: "Time series: never shuffle time",
            },
            {
              kind: "p",
              text: "Standard k-fold shuffles, which for temporal data means training on the future to predict the past — leakage that inflates every score. **Forward-chaining** (expanding-window) CV respects time: train on months 1-6, test on 7; train on 1-7, test on 8; and so on. Each fold simulates exactly the deployed situation: predicting the next period from all history so far.",
            },
            {
              kind: "code",
              caption: "Expanding-window splits for time-ordered data.",
              code: "def forward_chain_splits(n, n_splits, min_train):\n    fold = (n - min_train) // n_splits\n    for i in range(n_splits):\n        end_train = min_train + i * fold\n        yield list(range(end_train)), \\\n              list(range(end_train, min(end_train + fold, n)))\n\n# Train always precedes test in time; no shuffling, no leakage.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Preprocessing belongs inside the fold",
              text: "Scaling, imputation, and feature selection must be fit on each fold's training portion only, then applied to its test portion. Fitting them once on the full dataset before splitting leaks test-set statistics into training — a subtle bug that quietly inflates every fold's score.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "CV estimates the procedure, not one model",
              text: "The k trained models are discarded. What CV estimates is how well your recipe — this model family, these features, this preprocessing — performs on unseen data. The final production model is then retrained with that recipe on all available training data.",
            },
          ],
          quiz: [
            {
              id: "cv-1",
              prompt: "What problem does k-fold cross-validation solve compared to a single train/test split?",
              options: [
                "It makes training faster",
                "It replaces one split-dependent score with an average over many splits, plus a spread",
                "It removes the need for a test set entirely",
                "It guarantees higher accuracy",
              ],
              answer: 1,
              explanation:
                "A single split's score depends on which examples landed in the test set. K-fold averages k complementary splits, giving a more stable estimate and a variance to judge differences against.",
            },
            {
              id: "cv-2",
              prompt: "In 5-fold CV on 1,000 examples, how many times is each example used for testing?",
              options: ["Five times", "Exactly once", "Zero to five times, at random", "Depends on the model"],
              answer: 1,
              explanation:
                "The folds partition the data: each example belongs to exactly one fold, which serves as the test set exactly once. It appears in training for the other four fits.",
            },
            {
              id: "cv-3",
              prompt: "Why is stratified k-fold the default for imbalanced classification?",
              options: [
                "It trains fewer models",
                "It preserves class proportions per fold, so no fold ends up nearly empty of the rare class",
                "It removes the majority class",
                "It only works on balanced data",
              ],
              answer: 1,
              explanation:
                "With a 2% positive class, plain random folds can contain almost no positives, making per-fold metrics meaningless. Stratification keeps every fold's class ratio close to the dataset's.",
            },
            {
              id: "cv-4",
              prompt: "The main reason leave-one-out CV is rarely used on large datasets is:",
              options: [
                "It cannot be implemented in Python",
                "It requires training n models — one per example",
                "It ignores most of the training data",
                "It only works for regression",
              ],
              answer: 1,
              explanation:
                "LOO is k = n: 100,000 examples means 100,000 model fits. Combined with the high variance of its estimates, 5- or 10-fold is almost always the better deal.",
            },
            {
              id: "cv-5",
              prompt: "Why must time-series data use forward-chaining CV instead of shuffled k-fold?",
              options: [
                "Time-series data is too large to shuffle",
                "Shuffling puts future observations in training folds, leaking information the deployed model will never have",
                "Forward-chaining trains faster",
                "Shuffled k-fold cannot compute RMSE",
              ],
              answer: 1,
              explanation:
                "Deployment predicts the future from the past. Shuffled folds train on later data to predict earlier data — temporal leakage that inflates the score. Forward-chaining keeps train strictly before test.",
            },
          ],
          practice: [
            { slug: "kfold-cross-validation", title: "K-Fold Cross-Validation Indices", difficulty: "Medium" },
            { slug: "stratified-split", title: "Stratified Train/Test Split", difficulty: "Medium" },
            { slug: "time-ordered-split", title: "Time-Ordered Split", difficulty: "Easy" },
          ],
        },
        {
          slug: "imbalance-and-tuning",
          title: "Imbalanced Data and Tuning Hygiene",
          minutes: 15,
          objectives: [
            "Apply resampling, class weights, and threshold moving to imbalanced problems",
            "Pick metrics that stay honest under imbalance",
            "Tune hyperparameters without contaminating the test set",
          ],
          blocks: [
            {
              kind: "p",
              text: "Fraud, rare diseases, machine failures — the events worth predicting are usually rare. Imbalance breaks naive pipelines twice: the loss barely notices the minority class during training, and accuracy hides the failure during evaluation. The remedies act at three points in the pipeline: the data, the loss, or the decision.",
            },
            {
              kind: "list",
              items: [
                "**Resampling (data level):** oversample the minority class (duplicate or synthesize examples) or undersample the majority. Cheap and model-agnostic; oversampling risks overfitting the duplicated examples, undersampling throws away data.",
                "**Class weights (loss level):** multiply each minority-class error's contribution to the loss, making the model pay attention without touching the data. Most libraries expose this as a single argument.",
                "**Threshold moving (decision level):** train as usual, then lower the flagging threshold below 0.5, chosen on validation data from the precision-recall trade-off or explicit costs — the technique from the calibration lesson.",
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Resample the training folds only",
              text: "Oversampling before splitting puts copies of the same minority example in both train and test — the model is then evaluated on examples it memorized. Resample inside each training fold, after the split, and never touch validation or test distributions: evaluation must reflect the real class ratio the model will face.",
            },
            {
              kind: "p",
              text: "Evaluation under imbalance means retiring accuracy and choosing metrics that account for chance agreement: balanced accuracy, PR-AUC, **Cohen's kappa** (agreement beyond what the class ratio alone would produce), or **Matthews correlation** (a single correlation-like score using all four confusion-matrix cells, hard to inflate by exploiting imbalance).",
            },
            {
              kind: "heading",
              text: "Hyperparameter search without self-deception",
            },
            {
              kind: "p",
              text: "Hyperparameters — tree depth, regularization strength, learning rate — are chosen, not learned, and **the choosing is itself a form of fitting**. Try 200 configurations and pick the best score on some dataset, and that score is optimistically biased: partly skill, partly luck of that particular dataset. Whatever data selected the winner can no longer testify about it.",
            },
            {
              kind: "code",
              caption: "The hygiene pattern: select on CV, report on untouched test.",
              code: "def grid_search(configs, cv_score, final_score):\n    # 1. Selection: every config scored by CV on TRAINING data only.\n    scored = [(cv_score(c), c) for c in configs]\n    best_cv, best = max(scored)\n    # 2. Report: the untouched test set is consulted exactly once.\n    return best, final_score(best)\n\n# best_cv is biased (it won a 200-way contest);\n# final_score(best) is the honest number.",
            },
            {
              kind: "list",
              ordered: true,
              items: [
                "Split off the test set first and lock it away.",
                "Run the search — grid, random, or Bayesian — scoring every configuration by cross-validation on the training data alone.",
                "Pick the winner by CV score, retrain it on all training data, and only then evaluate once on the test set. That final number is the one you report.",
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Random search beats grid on a budget",
              text: "Grid search spends its budget on redundant combinations of unimportant parameters. Sampling configurations at random covers each individual parameter's range far better for the same number of trials — with a handful of important hyperparameters, random search is the stronger default.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "The test set has a lifetime of one",
              text: "Peek at the test score, tweak, and re-evaluate — even twice — and the test set has silently become a validation set: your choices now fit its quirks. If iteration must continue after test evaluation, the honest options are a fresh holdout or nested cross-validation, not another peek.",
            },
          ],
          quiz: [
            {
              id: "imb-1",
              prompt: "Class weights address imbalance by:",
              options: [
                "Deleting majority-class examples",
                "Scaling up the minority class's contribution to the training loss",
                "Lowering the decision threshold",
                "Duplicating minority examples in the test set",
              ],
              answer: 1,
              explanation:
                "Weights act at the loss level: each minority-class error costs more, forcing the optimizer to attend to the rare class without altering the data or the decision rule.",
            },
            {
              id: "imb-2",
              prompt: "Why must oversampling happen AFTER the train/test split, inside training folds only?",
              options: [
                "Oversampling is too slow to run twice",
                "Duplicating before splitting places copies of one example on both sides, so the model is tested on memorized data",
                "Test sets must always be oversampled instead",
                "Oversampling changes the feature count",
              ],
              answer: 1,
              explanation:
                "Copies of the same minority example landing in both train and test turns evaluation into a memory test — inflated scores that vanish in production. Evaluation data must keep the real class ratio, untouched.",
            },
            {
              id: "imb-3",
              prompt: "What makes Matthews correlation (MCC) robust under imbalance?",
              options: [
                "It ignores the majority class entirely",
                "It uses all four confusion-matrix cells, so exploiting the class ratio cannot inflate it",
                "It only counts true positives",
                "It is always higher than accuracy",
              ],
              answer: 1,
              explanation:
                "MCC is a correlation between predictions and truth built from TP, TN, FP, and FN together. Always-predict-majority strategies that fool accuracy score near zero on MCC.",
            },
            {
              id: "imb-4",
              prompt: "After trying 200 hyperparameter configurations, the best validation score is 0.91. Why is 0.91 an optimistic estimate of real performance?",
              options: [
                "Validation sets are always mislabeled",
                "The winner of a 200-way contest partly won by fitting that dataset's particular quirks",
                "Hyperparameters do not affect performance",
                "0.91 is above the maximum possible score",
              ],
              answer: 1,
              explanation:
                "Selecting the max of 200 noisy scores captures luck along with skill — winner's bias. That is why the winner must be re-evaluated once on data that played no part in the selection.",
            },
            {
              id: "imb-5",
              prompt: "You evaluated on the test set, made changes, and want to evaluate again. What has happened to the test set?",
              options: [
                "Nothing — test sets are reusable indefinitely",
                "It has effectively become a validation set; your changes now adapt to it, biasing future scores",
                "It has become the training set",
                "It must simply be re-shuffled first",
              ],
              answer: 1,
              explanation:
                "Once a result influences your decisions, subsequent evaluations on the same data are contaminated — choices fit its quirks. Honest iteration needs a fresh holdout or nested CV, not repeated peeks.",
            },
          ],
          practice: [
            { slug: "cohens-kappa", title: "Cohen's Kappa", difficulty: "Easy" },
            { slug: "matthews-correlation", title: "Matthews Correlation Coefficient", difficulty: "Medium" },
            { slug: "three-way-split", title: "Train/Validation/Test Split", difficulty: "Easy" },
          ],
        },
      ],
    },
  ],
};
