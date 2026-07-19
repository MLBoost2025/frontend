import type { Course } from "../types";

export const foundations: Course = {
  slug: "foundations-of-ml",
  title: "Foundations of Machine Learning",
  tagline: "What learning from data actually means",
  level: "Beginner",
  accent: "from-sky-500 to-blue-600",
  description:
    "Start from zero and build the mental model everything else rests on: what a model is, how machines learn from examples, and why generalization — not memorization — is the whole game.",
  modules: [
    {
      slug: "thinking-in-ml",
      title: "Thinking in Machine Learning",
      description: "The core vocabulary and the three ways machines learn.",
      lessons: [
        {
          slug: "what-is-machine-learning",
          title: "What Is Machine Learning?",
          minutes: 12,
          objectives: [
            "Explain the difference between rule-based programming and learning from data",
            "Define model, parameters, and training in plain language",
            "Recognize problems where ML is (and is not) the right tool",
          ],
          blocks: [
            {
              kind: "p",
              text: "In traditional programming, a human writes the rules: **if** the email contains a known scam phrase, **then** flag it as spam. Machine learning flips this around. Instead of writing the rules, you show the computer thousands of examples of spam and non-spam emails, and it works out the rules itself.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Machine learning",
              text: "A program is said to learn when its performance at a task improves with experience — that is, with more data. The output of learning is a model: a function with tunable parameters that maps inputs to predictions.",
            },
            {
              kind: "p",
              text: "Three words carry most of the weight in that definition. The **model** is the shape of the function you are fitting — a line, a tree, a neural network. The **parameters** are the numbers inside it that the algorithm is free to adjust. **Training** is the process of adjusting those parameters so the model's predictions match the examples you gave it.",
            },
            {
              kind: "code",
              caption: "The smallest possible model: one input, two parameters.",
              code: "def predict(x, w, b):\n    # w and b are the parameters the algorithm learns.\n    return w * x + b\n\n# Training = choosing w and b so predictions match known examples.\n# For house prices: x = area in sq ft, prediction = price.",
            },
            {
              kind: "heading",
              text: "When is ML the right tool?",
            },
            {
              kind: "p",
              text: "ML earns its complexity when the rules are too subtle, too numerous, or too fast-changing for a person to write down. Recognizing a face, ranking search results, predicting delivery time — nobody can hand-write those rules. But if a task has clear, stable rules (compute tax from a bracket table), plain code is simpler, cheaper, and easier to trust.",
            },
            {
              kind: "list",
              items: [
                "**Good fit:** patterns exist in data but are hard to articulate — image recognition, fraud detection, recommendation.",
                "**Poor fit:** exact rules are known — tax calculation, unit conversion, calendar arithmetic.",
                "**Poor fit:** almost no data exists, or every example is unique with no repeatable pattern.",
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "The data is the spec",
              text: "In ML, the examples you train on play the role that the specification plays in normal software. A model can only be as good as the data that taught it — garbage in, garbage out is not a slogan here, it is the mechanism.",
            },
            {
              kind: "p",
              text: "Everything in this curriculum builds on this framing: choose a model shape, define what a good fit means, and let an algorithm search for the parameters. The rest — features, losses, validation, neural networks — is refinement of those three steps.",
            },
          ],
          quiz: [
            {
              id: "wiml-1",
              prompt: "What is the fundamental difference between machine learning and traditional rule-based programming?",
              options: [
                "ML programs run faster than rule-based programs",
                "In ML, the rules are inferred from example data rather than written by hand",
                "ML programs never make mistakes once trained",
                "Rule-based programs cannot process large datasets",
              ],
              answer: 1,
              explanation:
                "The defining shift is who writes the rules. In traditional programming a human encodes the logic; in ML, an algorithm adjusts a model's parameters so its behavior matches example data.",
            },
            {
              id: "wiml-2",
              prompt: "In the expression predict(x) = w·x + b, what are w and b called?",
              options: [
                "Features",
                "Labels",
                "Parameters",
                "Predictions",
              ],
              answer: 2,
              explanation:
                "w and b are parameters — the numbers inside the model that training adjusts. The input x is a feature, and the known correct outputs used during training are labels.",
            },
            {
              id: "wiml-3",
              prompt: "Which task is the WEAKEST candidate for machine learning?",
              options: [
                "Detecting fraudulent credit-card transactions",
                "Converting temperatures from Celsius to Fahrenheit",
                "Recommending movies a user might enjoy",
                "Transcribing spoken audio to text",
              ],
              answer: 1,
              explanation:
                "Temperature conversion has an exact, known formula — learning it from data adds cost and error for no benefit. The other tasks involve subtle patterns nobody can fully write down.",
            },
            {
              id: "wiml-4",
              prompt: "A model is best described as:",
              options: [
                "A database of all the training examples",
                "A function with adjustable parameters that maps inputs to predictions",
                "A set of if-then rules written by an engineer",
                "A report summarizing patterns in the data",
              ],
              answer: 1,
              explanation:
                "A model is a parameterized function. Training tunes its parameters so the mapping from inputs to outputs agrees with the examples — it does not simply store the examples themselves.",
            },
            {
              id: "wiml-5",
              prompt: "Why is training data described as \"the spec\" of an ML system?",
              options: [
                "Because data files include formal specifications",
                "Because the model's learned behavior is determined by the examples it was shown",
                "Because regulators require data documentation",
                "Because data storage defines system performance",
              ],
              answer: 1,
              explanation:
                "The model learns whatever the data demonstrates — including its gaps and biases. The examples define the behavior the same way a spec defines what code should do.",
            },
          ],
          practice: [
            { slug: "accuracy-score", title: "Accuracy Score", difficulty: "Easy" },
            { slug: "mean-imputation", title: "Mean Imputation", difficulty: "Easy" },
          ],
        },
        {
          slug: "types-of-learning",
          title: "Supervised, Unsupervised, and Reinforcement Learning",
          minutes: 14,
          objectives: [
            "Distinguish the three main learning paradigms by what feedback the algorithm receives",
            "Classify a real problem as regression or classification",
            "Recognize clustering and dimensionality reduction as unsupervised tasks",
          ],
          blocks: [
            {
              kind: "p",
              text: "Learning paradigms differ by one question: **what feedback does the algorithm get?** With full answer keys, it is supervised learning. With no answers at all, it is unsupervised learning. With delayed rewards from interacting with an environment, it is reinforcement learning.",
            },
            {
              kind: "heading",
              text: "Supervised learning: learning with an answer key",
            },
            {
              kind: "p",
              text: "Every training example is a pair: an input and its correct output, called the **label**. The model learns the mapping. When the label is a number — a price, a temperature, a duration — the task is **regression**. When the label is a category — spam or not, cat or dog or bird — the task is **classification**.",
            },
            {
              kind: "table",
              headers: ["Task", "Input", "Label", "Type"],
              rows: [
                ["House pricing", "Area, location, age", "Sale price (₹)", "Regression"],
                ["Spam filtering", "Email text", "Spam / not spam", "Classification"],
                ["Medical triage", "Symptoms, vitals", "One of 5 urgency levels", "Classification"],
                ["Demand forecast", "Past sales, season", "Units sold next week", "Regression"],
              ],
            },
            {
              kind: "heading",
              text: "Unsupervised learning: structure without answers",
            },
            {
              kind: "p",
              text: "Here the data has no labels — the algorithm must find structure on its own. **Clustering** groups similar examples (customer segments, topic groups). **Dimensionality reduction** compresses many features into few while keeping what matters (visualizing high-dimensional data, removing redundancy). There is no single right answer, which makes evaluation genuinely harder.",
            },
            {
              kind: "heading",
              text: "Reinforcement learning: learning by acting",
            },
            {
              kind: "p",
              text: "An **agent** takes actions in an environment and receives rewards — often delayed. No one tells it the correct action; it must discover strategies that maximize long-run reward. Game playing, robotics, and ad-serving policies live here. It is the most general paradigm and also the hardest to get working.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "The label question comes first",
              text: "Before choosing any algorithm, ask: do I have labels, and what type are they? Answering this single question tells you which family of methods applies. Teams that skip it end up forcing classification tools onto clustering problems and vice versa.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Paradigms mix in practice",
              text: "Real systems combine paradigms: a recommender may cluster users (unsupervised), predict ratings (supervised), and tune which items to show from click feedback (reinforcement). The taxonomy organizes tools, not products.",
            },
          ],
          quiz: [
            {
              id: "tol-1",
              prompt: "What single question most directly determines whether a task is supervised or unsupervised?",
              options: [
                "How large is the dataset?",
                "Are labeled correct outputs available for the training examples?",
                "Is the data numeric or text?",
                "Will the model run in real time?",
              ],
              answer: 1,
              explanation:
                "The paradigms are defined by the feedback available. Labels present → supervised; absent → unsupervised; delayed rewards from interaction → reinforcement learning.",
            },
            {
              id: "tol-2",
              prompt: "Predicting tomorrow's electricity demand in megawatts is:",
              options: [
                "Classification",
                "Clustering",
                "Regression",
                "Reinforcement learning",
              ],
              answer: 2,
              explanation:
                "The target is a continuous number (megawatts), so this is regression — supervised learning with a numeric label.",
            },
            {
              id: "tol-3",
              prompt: "Grouping customers by purchasing behavior without any predefined groups is:",
              options: [
                "Regression",
                "Clustering",
                "Classification",
                "Supervised learning",
              ],
              answer: 1,
              explanation:
                "No labels exist — the algorithm must discover the groups itself. That is clustering, the flagship unsupervised task.",
            },
            {
              id: "tol-4",
              prompt: "What distinguishes reinforcement learning from supervised learning?",
              options: [
                "RL uses larger neural networks",
                "RL receives delayed rewards from actions instead of per-example correct answers",
                "RL only works on games",
                "RL requires no data of any kind",
              ],
              answer: 1,
              explanation:
                "In RL the agent is never told the correct action. It acts, observes rewards — often long after the decisive action — and must credit them back to its choices.",
            },
            {
              id: "tol-5",
              prompt: "Classifying support tickets into one of eight departments is best described as:",
              options: [
                "Binary classification",
                "Multi-class classification",
                "Regression",
                "Dimensionality reduction",
              ],
              answer: 1,
              explanation:
                "The label is one category out of eight — multi-class classification. Binary classification would be exactly two categories.",
            },
          ],
          practice: [
            { slug: "precision-recall", title: "Precision & Recall", difficulty: "Easy" },
            { slug: "one-hot-encoding", title: "One-Hot Encoding", difficulty: "Easy" },
          ],
        },
        {
          slug: "the-ml-workflow",
          title: "The Machine Learning Workflow",
          minutes: 13,
          objectives: [
            "Name the stages of an ML project from problem framing to monitoring",
            "Explain why data preparation dominates real project time",
            "Describe what a baseline is and why you build one first",
          ],
          blocks: [
            {
              kind: "p",
              text: "Real ML work is a loop, not a line. You frame the problem, prepare data, train, evaluate — then what you learn in evaluation sends you back to earlier steps. The model that ships is rarely the first one trained; it is the survivor of many loops.",
            },
            {
              kind: "list",
              ordered: true,
              items: [
                "**Frame the problem** — what decision will the prediction drive, and what metric defines success?",
                "**Collect and prepare data** — gather, clean, handle missing values, engineer features.",
                "**Establish a baseline** — the simplest model that could possibly work.",
                "**Train candidate models** — fit parameters on the training set.",
                "**Evaluate honestly** — measure on data the model has never seen.",
                "**Deploy and monitor** — serve predictions and watch for the world drifting away from the training data.",
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Where the time really goes",
              text: "Practitioners consistently report spending well over half their time on data work — collection, cleaning, labeling, feature preparation — and a small fraction on modeling. Skill with data preparation is not the boring part of ML; it is most of ML.",
            },
            {
              kind: "heading",
              text: "Baselines: the cheapest insurance in ML",
            },
            {
              kind: "p",
              text: "A **baseline** is a deliberately simple reference: predict the mean, predict the most common class, or use a tiny linear model. It costs minutes and buys two things. First, a sanity floor — if your deep model cannot beat predict-the-mean, something is broken. Second, a measure of how much signal the problem even has.",
            },
            {
              kind: "code",
              caption: "A majority-class baseline for classification.",
              code: "from collections import Counter\n\ndef majority_baseline(train_labels, test_size):\n    most_common = Counter(train_labels).most_common(1)[0][0]\n    return [most_common] * test_size\n\n# If 92% of emails are not-spam, this baseline is 92% accurate.\n# Any real model must beat that number to be worth its cost.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "The 92% trap",
              text: "A model with 92% accuracy sounds excellent — until you notice the majority baseline also scores 92%. Always compare against a baseline before celebrating a metric. Later lessons cover metrics that resist this trap.",
            },
            {
              kind: "p",
              text: "Finally, deployment is a beginning, not an end. Data in the wild **drifts**: user behavior shifts, sensors age, fraud adapts. Monitoring prediction quality in production, and retraining when it decays, is part of the workflow — not an optional extra.",
            },
          ],
          quiz: [
            {
              id: "wf-1",
              prompt: "Why is the ML workflow described as a loop rather than a line?",
              options: [
                "Because training algorithms iterate over the data multiple times",
                "Because evaluation results routinely send you back to data preparation or modeling",
                "Because models must be retrained every day",
                "Because the same code runs repeatedly in production",
              ],
              answer: 1,
              explanation:
                "What you learn from honest evaluation — errors, biases, missing signal — feeds back into earlier stages. Shipping models are survivors of many such loops, not first drafts.",
            },
            {
              id: "wf-2",
              prompt: "Which stage typically consumes the most time in real ML projects?",
              options: [
                "Choosing the neural network architecture",
                "Data collection, cleaning, and preparation",
                "Writing the deployment service",
                "Hyperparameter tuning",
              ],
              answer: 1,
              explanation:
                "Data work dominates in practice — commonly more than half of total project time. Modeling is a comparatively small slice.",
            },
            {
              id: "wf-3",
              prompt: "What is the main purpose of building a baseline model first?",
              options: [
                "It usually becomes the production model",
                "It provides a sanity floor that any real model must beat",
                "It is required by ML frameworks",
                "It reduces the size of the training data needed",
              ],
              answer: 1,
              explanation:
                "A baseline tells you what \"good\" means for this problem. If a complex model cannot beat predict-the-most-common-class, the model — or the pipeline — is broken.",
            },
            {
              id: "wf-4",
              prompt: "A dataset is 92% class A. A classifier scores 92% accuracy. What should you conclude?",
              options: [
                "The model is excellent",
                "The model may have learned nothing — it matches the majority-class baseline",
                "The dataset is too small",
                "The model is overfitting",
              ],
              answer: 1,
              explanation:
                "Always predicting class A also scores 92%. Matching the baseline is evidence the model may have learned nothing useful — accuracy alone cannot distinguish them.",
            },
            {
              id: "wf-5",
              prompt: "Why does a deployed model need monitoring?",
              options: [
                "Because servers can run out of memory",
                "Because real-world data drifts away from the training distribution, decaying prediction quality",
                "Because users need usage statistics",
                "Because monitoring speeds up inference",
              ],
              answer: 1,
              explanation:
                "The world changes — behavior shifts, adversaries adapt, sensors age. A model frozen at training time silently degrades as reality drifts, so production quality must be watched and retraining scheduled.",
            },
          ],
          practice: [
            { slug: "compute-f1-score", title: "Compute F1 Score", difficulty: "Easy" },
            { slug: "balanced-accuracy", title: "Balanced Accuracy", difficulty: "Easy" },
          ],
        },
      ],
    },
    {
      slug: "data-and-generalization",
      title: "Data & Generalization",
      description: "Features, labels, honest evaluation, and the bias-variance trade-off.",
      lessons: [
        {
          slug: "features-and-labels",
          title: "Features, Labels, and the Design Matrix",
          minutes: 12,
          objectives: [
            "Define features, labels, and examples precisely",
            "Read data as a design matrix of rows (examples) and columns (features)",
            "Explain why feature quality bounds model quality",
          ],
          blocks: [
            {
              kind: "p",
              text: "Models do not see the world — they see the **features** you extract from it. A feature is one measured property of an example: a house's area, an email's word counts, a patient's blood pressure. The **label** is the answer you want predicted. One complete observation — all its features plus its label — is an **example**.",
            },
            {
              kind: "p",
              text: "Structured data is conventionally arranged as a **design matrix**: one row per example, one column per feature, with labels in a separate column vector. Nearly every ML library speaks this format, usually written X for features and y for labels.",
            },
            {
              kind: "code",
              caption: "Three examples, four features, one label column.",
              code: "# X: design matrix (rows = houses, columns = features)\n#     area  bedrooms  age  dist_km\nX = [[1200,      3,   12,     4.5],\n     [ 850,      2,   30,     1.2],\n     [2100,      4,    2,     8.9]]\n\n# y: labels (sale price in lakhs)\ny = [95.0, 72.5, 168.0]",
            },
            {
              kind: "heading",
              text: "Feature quality bounds model quality",
            },
            {
              kind: "p",
              text: "If the signal is not in the features, no model can find it. Predicting house price without location data caps every model's ceiling, however sophisticated. Conversely, one well-designed feature (price per square foot of the neighborhood) can let a simple model beat a complex one fed raw inputs. This is why **feature engineering** — crafting informative columns — has its own course in this curriculum.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Feature engineering",
              text: "Transforming raw data into features that expose the underlying pattern to the model: ratios, aggregates, date decompositions, text statistics, domain-specific measurements.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Features must exist at prediction time",
              text: "A feature is only legal if its value is available when the model must predict. Using \"total repairs in the first year\" to predict whether a new car will be defective smuggles the future into the present — a mistake called leakage, covered in depth later.",
            },
            {
              kind: "p",
              text: "Labels deserve equal scrutiny. Noisy or inconsistent labeling — two annotators disagreeing on what counts as spam — puts a hard ceiling on measurable performance. When a model plateaus, experienced practitioners audit the labels before reaching for a bigger model.",
            },
          ],
          quiz: [
            {
              id: "fl-1",
              prompt: "In a design matrix X, what do rows and columns represent?",
              options: [
                "Rows are features; columns are examples",
                "Rows are examples; columns are features",
                "Rows are labels; columns are predictions",
                "Rows are models; columns are datasets",
              ],
              answer: 1,
              explanation:
                "The convention is one row per example (observation) and one column per feature (measured property). Labels live in a separate vector y.",
            },
            {
              id: "fl-2",
              prompt: "Why can no model overcome fundamentally uninformative features?",
              options: [
                "Because training would take too long",
                "Because a model can only combine the signal present in its inputs",
                "Because libraries reject bad features",
                "Because uninformative features cause overflow errors",
              ],
              answer: 1,
              explanation:
                "A model is a function of its inputs. If the inputs carry no information about the label, no parameter setting can conjure it — the signal must be in the features.",
            },
            {
              id: "fl-3",
              prompt: "Which is an example of feature engineering?",
              options: [
                "Renaming a column from 'a' to 'area'",
                "Deriving 'price per square foot' from price and area columns",
                "Sorting the dataset by date",
                "Saving the data in a faster file format",
              ],
              answer: 1,
              explanation:
                "Feature engineering creates new informative columns from raw data. A ratio like price per square foot can expose a pattern that raw price and area hide.",
            },
            {
              id: "fl-4",
              prompt: "Using 'number of warranty claims in the car's first year' as a feature to predict whether a car will be defective at manufacture is wrong because:",
              options: [
                "Warranty data is usually inaccurate",
                "The feature is not available at prediction time — it leaks the future",
                "Claim counts are not numeric",
                "The feature has too many missing values",
              ],
              answer: 1,
              explanation:
                "At manufacture time, first-year claims have not happened yet. Training with future information produces a model that cannot work in production — this is leakage.",
            },
            {
              id: "fl-5",
              prompt: "A model's accuracy plateaus well below expectations. What should an experienced practitioner audit early?",
              options: [
                "The GPU drivers",
                "The consistency and correctness of the labels",
                "The random seed",
                "The programming language used",
              ],
              answer: 1,
              explanation:
                "Noisy labels cap measurable performance for every model. Auditing label quality is cheaper than architecture search and often explains the plateau.",
            },
          ],
          practice: [
            { slug: "minmax-scaling", title: "Min-Max Scaling", difficulty: "Easy" },
            { slug: "frequency-encoding", title: "Frequency Encoding", difficulty: "Easy" },
          ],
        },
        {
          slug: "train-test-generalization",
          title: "Train/Test Splits and Generalization",
          minutes: 14,
          objectives: [
            "Explain why models must be evaluated on data they never trained on",
            "Perform a proper train/validation/test split",
            "Define overfitting and underfitting in terms of train vs. test error",
          ],
          blocks: [
            {
              kind: "p",
              text: "The goal of ML is **generalization**: performing well on data the model has never seen. Performance on the training set proves nothing — a model can simply memorize its training examples, like a student who memorizes past papers and fails the real exam.",
            },
            {
              kind: "p",
              text: "The defense is simple and non-negotiable: **hold out data**. Split the dataset before training. Fit on the training set; measure on the held-out test set. Test error estimates real-world performance; training error mostly measures capacity to memorize.",
            },
            {
              kind: "code",
              caption: "A three-way split: fit, tune, and final report each get their own data.",
              code: "import random\n\ndef three_way_split(examples, seed=42):\n    rng = random.Random(seed)\n    shuffled = examples[:]\n    rng.shuffle(shuffled)\n    n = len(shuffled)\n    train = shuffled[: int(0.7 * n)]      # fit parameters\n    val   = shuffled[int(0.7 * n): int(0.85 * n)]  # tune choices\n    test  = shuffled[int(0.85 * n):]     # touched ONCE, at the end\n    return train, val, test",
            },
            {
              kind: "p",
              text: "Why three parts? Because tuning is also learning. If you pick hyperparameters by repeatedly checking the test set, information leaks from test into your choices, and the final number flatters you. The **validation set** absorbs tuning; the **test set** is opened once, at the very end, for the honest number.",
            },
            {
              kind: "heading",
              text: "Overfitting and underfitting",
            },
            {
              kind: "table",
              headers: ["Symptom", "Train error", "Test error", "Diagnosis"],
              rows: [
                ["Memorizing noise", "Very low", "High", "Overfitting"],
                ["Too simple to fit signal", "High", "High (similar)", "Underfitting"],
                ["Healthy fit", "Low", "Slightly higher than train", "Good generalization"],
              ],
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Overfitting",
              text: "The model fits the training data's noise and quirks, not just its signal. Train error keeps falling while test error rises — the gap between them is the tell.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Split before you look",
              text: "Every choice made after seeing test data — features, preprocessing, model family — contaminates it. Split first. And for time-ordered data (sales, sensors, markets), split by time: training on the future to predict the past is leakage wearing a disguise.",
            },
            {
              kind: "p",
              text: "For classification with rare classes, use a **stratified** split, which preserves class proportions in every part — otherwise a random split may leave the test set with almost no examples of the rare class, making its metrics meaningless.",
            },
          ],
          quiz: [
            {
              id: "ttg-1",
              prompt: "Why does low training error alone prove nothing about a model's quality?",
              options: [
                "Training error is always miscalculated",
                "A model can achieve low training error by memorizing, which does not transfer to new data",
                "Training sets are always too small",
                "Low training error implies slow inference",
              ],
              answer: 1,
              explanation:
                "The goal is generalization to unseen data. Memorization drives training error to zero while leaving real-world performance untested — only held-out data measures what matters.",
            },
            {
              id: "ttg-2",
              prompt: "What is the role of the validation set, as distinct from the test set?",
              options: [
                "It stores corrupted examples",
                "It absorbs hyperparameter tuning so the test set stays untouched until the final report",
                "It is used to train the model twice",
                "It replaces the training set for small data",
              ],
              answer: 1,
              explanation:
                "Tuning is also learning. Choices made by repeatedly consulting a dataset adapt to it — so tuning consults validation, and the test set is opened once for the honest final number.",
            },
            {
              id: "ttg-3",
              prompt: "Train error 0.5%, test error 14%. Diagnosis?",
              options: [
                "Underfitting",
                "Overfitting",
                "Healthy generalization",
                "Label noise",
              ],
              answer: 1,
              explanation:
                "A large gap between very low train error and high test error is the signature of overfitting: the model learned the training set's noise, not the transferable signal.",
            },
            {
              id: "ttg-4",
              prompt: "For a sales-forecasting dataset ordered by date, the correct split is:",
              options: [
                "Uniformly random",
                "By time — train on earlier data, test on later data",
                "Alphabetically by product name",
                "By file size",
              ],
              answer: 1,
              explanation:
                "In production the model will predict the future from the past. A random split trains on future rows to predict past ones — temporal leakage that inflates measured accuracy.",
            },
            {
              id: "ttg-5",
              prompt: "When is a stratified split most important?",
              options: [
                "When features are on different scales",
                "When class proportions are imbalanced and rare classes must appear in every part",
                "When the dataset fits in memory",
                "When using neural networks",
              ],
              answer: 1,
              explanation:
                "Stratification preserves class ratios in each part. Without it, a random split of imbalanced data can leave the test set with almost none of the rare class, making evaluation of that class meaningless.",
            },
          ],
          practice: [
            { slug: "train-test-split", title: "Train/Test Split", difficulty: "Easy" },
            { slug: "three-way-split", title: "Three-Way Split", difficulty: "Easy" },
            { slug: "stratified-split", title: "Stratified Split", difficulty: "Medium" },
            { slug: "time-ordered-split", title: "Time-Ordered Split", difficulty: "Easy" },
          ],
        },
        {
          slug: "bias-variance",
          title: "The Bias-Variance Trade-off",
          minutes: 13,
          objectives: [
            "Define bias and variance as two distinct sources of error",
            "Connect model complexity to the bias-variance trade-off",
            "Choose the right remedy for high-bias vs. high-variance situations",
          ],
          blocks: [
            {
              kind: "p",
              text: "Why do models err on new data? Decompose the error and two distinct culprits appear. **Bias** is error from a model too rigid to capture the true pattern — a straight line forced through a curve. **Variance** is error from a model so flexible it reshapes itself around each training sample's noise — retrain on slightly different data, get a wildly different model.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Bias and variance",
              text: "Bias: systematic error from the model's assumptions being too simple for the truth. Variance: sensitivity of the learned model to which particular training sample it saw. Total expected error also includes irreducible noise no model can remove.",
            },
            {
              kind: "formula",
              formula: "Expected error = Bias² + Variance + Irreducible noise",
              explanation:
                "The classic decomposition: rigidity, instability, and noise add up. You can trade the first two against each other; the third is the floor.",
            },
            {
              kind: "p",
              text: "Model **complexity** is the dial that trades one for the other. A degree-1 polynomial through curved data has high bias, low variance: it is wrong the same way every time. A degree-15 polynomial has low bias, high variance: it can fit anything, including the noise. The sweet spot — enough flexibility for the signal, not enough to chase noise — minimizes their sum.",
            },
            {
              kind: "heading",
              text: "Diagnosis and treatment",
            },
            {
              kind: "table",
              headers: ["Diagnosis", "Signature", "Remedies"],
              rows: [
                [
                  "High bias (underfitting)",
                  "Train and test error both high, close together",
                  "More complex model, better features, train longer",
                ],
                [
                  "High variance (overfitting)",
                  "Train error low, test error much higher",
                  "More data, regularization, simpler model, feature pruning",
                ],
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "More data fixes variance, not bias",
              text: "Extra training data tames a high-variance model by averaging out noise. But a high-bias model is wrong by construction — feeding a straight line more points from a curve just gives you a confidently wrong straight line. Diagnose before you treat.",
            },
            {
              kind: "p",
              text: "This trade-off quietly organizes much of the field. Regularization (adding a penalty for complexity) buys lower variance at slight bias cost. Ensembles average many high-variance models to cancel their noise. Neural network tricks — dropout, early stopping — are variance control. When you meet these tools later, recognize them as moves on this same dial.",
            },
          ],
          quiz: [
            {
              id: "bv-1",
              prompt: "A model has high error on BOTH training and test sets, with the two numbers close together. Diagnosis?",
              options: [
                "High variance",
                "High bias (underfitting)",
                "Data leakage",
                "Perfect fit",
              ],
              answer: 1,
              explanation:
                "When even the training data cannot be fit well, the model is too rigid for the pattern — high bias. A high-variance model would at least fit the training set.",
            },
            {
              id: "bv-2",
              prompt: "Which remedy targets high VARIANCE?",
              options: [
                "Switching to a much more complex model",
                "Adding regularization or more training data",
                "Removing the validation set",
                "Training for more epochs on the same data",
              ],
              answer: 1,
              explanation:
                "Variance is sensitivity to the training sample's noise. More data averages the noise out; regularization penalizes the flexibility that chases it. More complexity would worsen it.",
            },
            {
              id: "bv-3",
              prompt: "Why does more training data NOT fix a high-bias model?",
              options: [
                "More data always fixes every model",
                "The model's assumptions are too simple to express the pattern, regardless of data volume",
                "Large datasets cause overflow",
                "High-bias models cannot read large files",
              ],
              answer: 1,
              explanation:
                "Bias is error by construction: a straight line cannot become a curve by seeing more points. Data volume addresses instability (variance), not rigidity (bias).",
            },
            {
              id: "bv-4",
              prompt: "Increasing a polynomial model's degree from 1 to 15 typically:",
              options: [
                "Increases bias and increases variance",
                "Decreases bias and increases variance",
                "Decreases both bias and variance",
                "Changes neither",
              ],
              answer: 1,
              explanation:
                "Higher degree means more flexibility: the model can capture more of the true pattern (bias falls) but also fits sample noise (variance rises). Complexity trades one for the other.",
            },
            {
              id: "bv-5",
              prompt: "In the error decomposition, what is 'irreducible noise'?",
              options: [
                "Error caused by slow hardware",
                "Randomness in the data-generating process that no model can predict",
                "Error from bugs in the code",
                "Error that regularization removes",
              ],
              answer: 1,
              explanation:
                "Some outcomes are genuinely random given the available features. That noise sets a floor under every model's error — the part not traded away by any complexity choice.",
            },
          ],
          practice: [
            { slug: "linear-regression-gd", title: "Linear Regression (Gradient Descent)", difficulty: "Medium" },
            { slug: "ridge-regression-normal-equation", title: "Ridge Regression (Normal Equation)", difficulty: "Medium" },
          ],
        },
      ],
    },
  ],
};
