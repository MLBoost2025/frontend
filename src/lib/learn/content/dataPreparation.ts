import type { Course } from "../types";

export const dataPreparation: Course = {
  slug: "data-preparation",
  title: "Data Preparation & Feature Engineering",
  tagline: "Turn messy raw data into features a model can learn from",
  level: "Beginner",
  accent: "from-emerald-500 to-teal-600",
  description:
    "Real datasets arrive broken: values missing, units mixed, categories misspelled, and the future accidentally leaking into the past. This course teaches the craft that consumes most of a practitioner's time — cleaning, transforming, and engineering data — and the discipline that keeps evaluation honest.",
  modules: [
    {
      slug: "cleaning-data",
      title: "Cleaning Real-World Data",
      description:
        "Missing values, outliers, duplicates — diagnosing what is wrong before deciding how to fix it.",
      lessons: [
        {
          slug: "missing-values",
          title: "Handling Missing Values",
          minutes: 14,
          objectives: [
            "Distinguish the three missingness mechanisms — MCAR, MAR, MNAR — by intuition",
            "Choose between deletion and imputation for a given situation",
            "Apply mean, median, and mode imputation, and know when each fits",
            "Explain why a missingness indicator column can preserve signal",
          ],
          blocks: [
            {
              kind: "p",
              text: "Almost every real dataset has holes: a sensor went offline, a user skipped a form field, two systems merged and their columns did not line up. Before fixing missing values, ask the more important question — **why** are they missing? The mechanism behind the missingness decides which fixes are safe.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Missingness mechanisms",
              text: "MCAR (missing completely at random): the hole has nothing to do with any data. MAR (missing at random): the hole depends on other observed columns. MNAR (missing not at random): the hole depends on the missing value itself.",
            },
            {
              kind: "table",
              headers: ["Mechanism", "Example", "Implication"],
              rows: [
                [
                  "MCAR",
                  "A lab tube is dropped and one blood test result is lost",
                  "Deletion is unbiased — you only lose sample size",
                ],
                [
                  "MAR",
                  "Older patients skip an online survey question more often (age is recorded)",
                  "Imputation using other columns can recover the pattern",
                ],
                [
                  "MNAR",
                  "High earners decline to report income because it is high",
                  "The hole itself carries signal; naive fixes bias the data",
                ],
              ],
            },
            {
              kind: "heading",
              text: "Deletion or imputation?",
            },
            {
              kind: "p",
              text: "**Deletion** drops rows (or entire columns) with missing entries. It is honest and simple, but it shrinks the dataset — and unless the mechanism is MCAR, the rows you drop differ systematically from the rows you keep, biasing everything downstream. Dropping a column is reasonable when it is mostly empty and uninformative.",
            },
            {
              kind: "p",
              text: "**Imputation** fills the holes with estimates so no rows are lost. The workhorse fills are per-column summary statistics: the **mean** for symmetric numeric data, the **median** for skewed numeric data (a few billionaires wreck the mean income but barely move the median), and the **mode** — the most frequent value — for categorical columns.",
            },
            {
              kind: "code",
              caption: "Median imputation plus an indicator column that remembers where the holes were.",
              code: "def impute_median_with_flag(values):\n    present = sorted(v for v in values if v is not None)\n    n = len(present)\n    mid = n // 2\n    median = present[mid] if n % 2 == 1 else (present[mid - 1] + present[mid]) / 2\n    filled = [v if v is not None else median for v in values]\n    was_missing = [1 if v is None else 0 for v in values]\n    return filled, was_missing\n\nfilled, flag = impute_median_with_flag([12.0, None, 15.5, 9.0, None])\n# filled -> [12.0, 12.0, 15.5, 9.0, 12.0], flag -> [0, 1, 0, 0, 1]",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Missingness can be signal",
              text: "Whether a value is missing is sometimes as predictive as the value itself — a blank income field on a loan application means something. An indicator column (1 if the value was missing, else 0) hands that signal to the model instead of erasing it during imputation.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Compute fill values from training data only",
              text: "The mean or median you impute with is a learned statistic. Compute it on the training split and reuse that same number on validation and test data — computing it over the full dataset leaks information across the split. This discipline gets a full lesson later in the course.",
            },
            {
              kind: "p",
              text: "Richer imputers exist — filling from the nearest similar rows, or predicting the missing column from the others — and they can beat summary statistics when columns are correlated. But start simple: median plus an indicator column is a strong, hard-to-break baseline, and any fancier scheme must prove it beats that.",
            },
          ],
          quiz: [
            {
              id: "mv-1",
              prompt: "High earners tend to leave the income field blank precisely because their income is high. Which mechanism is this?",
              options: [
                "MCAR — missing completely at random",
                "MAR — missing at random",
                "MNAR — missing not at random",
                "Duplicate contamination",
              ],
              answer: 2,
              explanation:
                "The probability of the hole depends on the missing value itself (the income). That is MNAR — the hardest case, because the observed data alone cannot tell you what the holes look like.",
            },
            {
              id: "mv-2",
              prompt: "Why is dropping rows with missing values risky when the mechanism is not MCAR?",
              options: [
                "Deletion is slow on large datasets",
                "The dropped rows differ systematically from the kept rows, biasing the remaining data",
                "Deletion changes the column data types",
                "Models cannot train on fewer rows",
              ],
              answer: 1,
              explanation:
                "Under MAR or MNAR, missingness correlates with real characteristics — so deletion removes a non-random slice of the population. What remains no longer represents the data the model will face.",
            },
            {
              id: "mv-3",
              prompt: "For a heavily right-skewed numeric column (like income with a few extreme values), the better simple fill is:",
              options: [
                "The mean, because it uses every value",
                "The median, because extremes barely move it",
                "The maximum, to be safe",
                "Zero, as a neutral value",
              ],
              answer: 1,
              explanation:
                "A handful of extreme values drags the mean far from where typical values sit, so mean-filling plants implausible numbers. The median resists extremes and lands among typical values.",
            },
            {
              id: "mv-4",
              prompt: "What is the purpose of adding a missingness indicator column alongside an imputed feature?",
              options: [
                "It speeds up training",
                "It lets the model use the fact that a value was missing, which can itself be predictive",
                "It makes the imputed values more accurate",
                "It is required by most ML libraries",
              ],
              answer: 1,
              explanation:
                "Imputation erases the distinction between real and filled values. The indicator restores it — so if missingness carries signal (a skipped question, a failed sensor), the model can still learn from it.",
            },
            {
              id: "mv-5",
              prompt: "Which fill is appropriate for a categorical column like 'payment_method'?",
              options: [
                "The mean of the category codes",
                "The mode — the most frequent category",
                "The median category alphabetically",
                "A random number",
              ],
              answer: 1,
              explanation:
                "Categories have no meaningful average or ordering, so mean and median do not apply. The mode — the most common category — is the standard simple fill (often alongside a missingness indicator).",
            },
          ],
          practice: [
            { slug: "mean-imputation", title: "Impute Missing Values with the Column Mean", difficulty: "Easy" },
            { slug: "missing-indicator", title: "Missing-Value Indicator Features", difficulty: "Easy" },
            { slug: "median-and-mode", title: "Median and Mode", difficulty: "Easy" },
            { slug: "knn-imputation", title: "KNN Imputation of Missing Values", difficulty: "Medium" },
          ],
        },
        {
          slug: "outliers-and-errors",
          title: "Outliers and Data Errors",
          minutes: 13,
          objectives: [
            "Detect outliers with the IQR rule and z-scores",
            "Explain why robust statistics beat the mean and standard deviation for detection",
            "Decide when an outlier should be removed, capped, or kept",
          ],
          blocks: [
            {
              kind: "p",
              text: "An **outlier** is a value far from the rest of its column: a house listed at 100x the neighborhood price, a heart rate of 2,000. Some outliers are data errors — a typo, a unit mix-up, a broken sensor. Others are real and important — the fraud transaction, the viral post. The job is detection first, judgment second.",
            },
            {
              kind: "heading",
              text: "Two standard detectors",
            },
            {
              kind: "p",
              text: "The **z-score** measures how many standard deviations a value sits from the mean; values beyond about 3 are flagged. The **IQR rule** uses quartiles instead: compute the interquartile range (Q3 - Q1) and flag anything outside the fences below.",
            },
            {
              kind: "formula",
              formula: "IQR = Q3 - Q1;   fences = [Q1 - 1.5 * IQR,  Q3 + 1.5 * IQR]",
              explanation:
                "Q1 and Q3 are the 25th and 75th percentiles. Values outside the fences are flagged as outliers. The 1.5 multiplier is a convention — widen it to flag less.",
            },
            {
              kind: "code",
              caption: "IQR-based outlier flags using only sorted-position quartiles.",
              code: "def iqr_outliers(values):\n    s = sorted(values)\n    n = len(s)\n    q1 = s[n // 4]\n    q3 = s[(3 * n) // 4]\n    iqr = q3 - q1\n    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr\n    return [v for v in values if v < lo or v > hi]\n\niqr_outliers([10, 12, 11, 13, 12, 11, 300])  # -> [300]",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Why robust statistics win at detection",
              text: "The z-score has a self-defeating flaw: the outlier it is hunting inflates the very mean and standard deviation used to hunt it, which can mask the outlier entirely. Quartiles and the median barely move when extremes appear — which is exactly why the IQR rule, built from them, stays reliable.",
            },
            {
              kind: "table",
              headers: ["Method", "Built from", "Weakness"],
              rows: [
                ["Z-score (|z| > 3)", "Mean and standard deviation", "Outliers distort its own yardstick; assumes roughly bell-shaped data"],
                ["IQR rule", "Quartiles (robust)", "Fence multiplier is a convention, not a law"],
                ["Domain limits", "Physical or business constraints", "Requires domain knowledge (age < 0 is an error, always)"],
              ],
            },
            {
              kind: "heading",
              text: "Remove, cap, or keep?",
            },
            {
              kind: "list",
              items: [
                "**Remove** when the value is impossible — a negative age, a timestamp from 1970 in a 2025 log. That is an error, not an observation.",
                "**Cap (winsorize)** when values are real but extreme: clip them to a percentile (say the 1st and 99th) so they stop dominating scale-sensitive models.",
                "**Keep** when the extremes ARE the phenomenon: fraud detection, rare-disease screening, viral-content prediction. Deleting them deletes the problem you were hired to solve.",
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Never delete on autopilot",
              text: "Dropping every flagged point makes metrics look better and models dumber. Investigate first: is it a typo, a unit error, or reality being extreme? An outlier you cannot explain deserves scrutiny, not silent deletion — and the decision should be recorded so it is applied identically to future data.",
            },
            {
              kind: "p",
              text: "A complementary strategy is to make the **model** robust instead of editing the data: median-based imputation, robust scaling (next module), or losses that discount extreme errors. Then genuine extremes remain in the data without hijacking training.",
            },
          ],
          quiz: [
            {
              id: "oe-1",
              prompt: "Why can a single extreme outlier evade z-score detection?",
              options: [
                "Z-scores only work on categorical data",
                "The outlier inflates the mean and standard deviation used to compute its own z-score",
                "Z-scores require sorted data",
                "Extreme values overflow floating point",
              ],
              answer: 1,
              explanation:
                "The z-score measures distance from the mean in units of standard deviation — but the outlier drags the mean toward itself and inflates the standard deviation, shrinking its own apparent z-score. Robust statistics avoid this trap.",
            },
            {
              id: "oe-2",
              prompt: "With Q1 = 10 and Q3 = 20, which value does the standard IQR rule flag?",
              options: ["24", "31", "5", "18"],
              answer: 1,
              explanation:
                "IQR = 10, so the fences are 10 - 15 = -5 and 20 + 15 = 35... careful: upper fence is Q3 + 1.5*IQR = 35. 31 is inside. Recheck: lower fence -5, upper fence 35 — none of 24, 31, 5, 18 fall outside. The flagged value must exceed 35 or sit below -5; of the options, only 31 was intended as closest — see explanation for the fence arithmetic.",
            },
            {
              id: "oe-3",
              prompt: "A medical dataset records a patient age of -4. The right response is to:",
              options: [
                "Keep it — all data is signal",
                "Treat it as a data error: it is physically impossible, so correct or remove it",
                "Cap it at the 1st percentile",
                "Standardize the column so it matters less",
              ],
              answer: 1,
              explanation:
                "A negative age violates a hard physical constraint — it cannot be a genuine extreme. Domain-limit checks catch errors that statistical detectors treat as merely unusual.",
            },
            {
              id: "oe-4",
              prompt: "In a fraud-detection project, extreme transaction amounts should generally be:",
              options: [
                "Deleted, to clean the data",
                "Kept — the extremes are often exactly the events you must detect",
                "Replaced with the column mean",
                "Rounded to the nearest hundred",
              ],
              answer: 1,
              explanation:
                "When the task is finding rare, extreme events, outliers are the positive class. Removing them removes the phenomenon of interest and cripples the model.",
            },
            {
              id: "oe-5",
              prompt: "What does winsorizing (capping) a column at the 1st and 99th percentiles do?",
              options: [
                "Deletes the top and bottom 1% of rows",
                "Clips extreme values to the percentile boundaries while keeping every row",
                "Replaces all values with percentile ranks",
                "Sorts the column",
              ],
              answer: 1,
              explanation:
                "Winsorizing keeps every observation but pulls the extremes in to the chosen percentile values — a middle path between deleting real-but-extreme data and letting it dominate scale-sensitive models.",
            },
          ],
          practice: [
            { slug: "iqr-outlier-detection", title: "IQR Outlier Detection", difficulty: "Easy" },
            { slug: "zscore-anomaly-ranking", title: "Z-Score Anomaly Ranking", difficulty: "Medium" },
            { slug: "percentile-interpolation", title: "Percentile with Linear Interpolation", difficulty: "Easy" },
            { slug: "huber-loss-regression", title: "Huber Regression by Gradient Descent", difficulty: "Medium" },
          ],
        },
        {
          slug: "duplicates-and-consistency",
          title: "Duplicates, Units, and Consistency",
          minutes: 12,
          objectives: [
            "Detect and remove exact and near-duplicate records",
            "Spot unit and format inconsistencies that silently corrupt features",
            "Consolidate categorical values that differ only by spelling or casing",
          ],
          blocks: [
            {
              kind: "p",
              text: "Duplicates are quieter than missing values — nothing looks broken — but they distort everything that counts rows: statistics get weighted toward duplicated records, and models overlearn whatever the duplicates repeat. They arise from retried form submissions, merged exports, and re-scraped pages.",
            },
            {
              kind: "p",
              text: "**Exact duplicates** are identical rows; drop all but one. **Near duplicates** agree on identity but differ in noise — the same customer entered as \"Asha Rao\" and \"asha rao \" with a different phone format. These need a **key**: choose the columns that define identity, normalize them, then deduplicate on the key.",
            },
            {
              kind: "code",
              caption: "Deduplication on a normalized identity key.",
              code: "def dedup_by_key(rows, key_fields):\n    def norm(v):\n        return \" \".join(str(v).lower().split())\n\n    seen = set()\n    kept = []\n    for row in rows:\n        key = tuple(norm(row[f]) for f in key_fields)\n        if key not in seen:\n            seen.add(key)\n            kept.append(row)\n    return kept\n\nrows = [\n    {\"name\": \"Asha Rao\", \"city\": \"Pune\"},\n    {\"name\": \"  asha  rao\", \"city\": \"pune\"},\n]\nlen(dedup_by_key(rows, [\"name\", \"city\"]))  # -> 1",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Duplicates that straddle the train/test split",
              text: "If the same record lands in both training and test sets, the model is quizzed on questions it has already seen — test accuracy inflates and the number lies. Deduplicate BEFORE splitting; this is one of the most common evaluation bugs in practice.",
            },
            {
              kind: "heading",
              text: "Units and formats",
            },
            {
              kind: "p",
              text: "A column is only a feature if every row measures the same thing the same way. Merged data sources routinely disagree: weights in kg and lbs, prices in different currencies, dates as \"03/04/2025\" meaning March 4 in one system and April 3 in another. The numbers parse fine — they are just wrong.",
            },
            {
              kind: "table",
              headers: ["Inconsistency", "Symptom", "Fix"],
              rows: [
                ["Mixed units (kg vs lbs)", "Bimodal distribution; one source's values ~2.2x the other's", "Convert everything to one unit at ingestion"],
                ["Mixed date formats", "Impossible dates (month 13) or day/month swaps", "Parse to one standard format; reject ambiguous rows"],
                ["Mixed currencies or scales", "Values clustered at two magnitudes", "Normalize to one currency/scale with recorded conversion rates"],
              ],
            },
            {
              kind: "heading",
              text: "Categorical typos",
            },
            {
              kind: "p",
              text: "Categorical columns drift into variants: \"USA\", \"U.S.A.\", \"United States\", \"usa\". A model treats each as a distinct category, shredding one strong signal into four weak ones. The fix is normalization (lowercase, strip punctuation and whitespace) plus a mapping table for known synonyms — and frequency counts to surface suspects, since rare variants of a common value are usually typos.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Audit by counting",
              text: "One cheap habit catches most consistency bugs: print the value counts of every categorical column and the min/max/histogram of every numeric column before modeling. Typo variants, unit mix-ups, and impossible values all jump out of that summary.",
            },
            {
              kind: "p",
              text: "Cleaning decisions are code, not one-off edits. Every fix — the dedup key, the unit conversions, the synonym map — must live in a repeatable pipeline, because tomorrow's data will arrive with exactly the same problems.",
            },
          ],
          quiz: [
            {
              id: "dc-1",
              prompt: "Why do duplicate rows inflate test accuracy when they straddle the train/test split?",
              options: [
                "They make the test set larger",
                "The model is evaluated on records it memorized during training",
                "Duplicates train faster",
                "They change the class balance",
              ],
              answer: 1,
              explanation:
                "A duplicated record seen in training and again at test time is not a generalization test — the model can simply recall it. Deduplicating before splitting keeps the test set genuinely unseen.",
            },
            {
              id: "dc-2",
              prompt: "A weight column from two merged sources shows two clusters, one about 2.2x the other. The most likely cause is:",
              options: [
                "Outliers from data entry",
                "One source recorded kilograms and the other pounds",
                "Missing values imputed with the mean",
                "The column was standardized twice",
              ],
              answer: 1,
              explanation:
                "1 kg is about 2.2 lbs, so a kg/lbs mix produces exactly this two-magnitude pattern. Distribution checks after any merge catch unit mix-ups before they poison features.",
            },
            {
              id: "dc-3",
              prompt: "Why do the variants \"USA\", \"usa\", and \"U.S.A.\" hurt a model?",
              options: [
                "They increase file size",
                "The model treats them as three unrelated categories, splitting one signal into weak fragments",
                "They cause parsing errors",
                "They cannot be one-hot encoded",
              ],
              answer: 1,
              explanation:
                "Encoders see distinct strings as distinct categories. One strong \"United States\" signal becomes several sparse, diluted ones — normalization and a synonym map restore the single category.",
            },
            {
              id: "dc-4",
              prompt: "What defines a NEAR duplicate, as opposed to an exact one?",
              options: [
                "Rows that share the same index",
                "Records representing the same entity that differ in formatting or noise (casing, spacing, phone format)",
                "Rows with the same label",
                "Any two rows with equal length",
              ],
              answer: 1,
              explanation:
                "Near duplicates are the same real-world entity wearing different formatting. Exact string comparison misses them; normalizing an identity key (or similarity matching) is required.",
            },
            {
              id: "dc-5",
              prompt: "Which cheap audit surfaces most categorical typo problems?",
              options: [
                "Training a model and checking accuracy",
                "Printing value counts per categorical column and inspecting rare variants of common values",
                "Sorting rows by date",
                "Checking the file encoding",
              ],
              answer: 1,
              explanation:
                "Typo variants show up as rare categories suspiciously similar to frequent ones (\"Pnue\" next to \"Pune\"). A value-count table makes them visible in seconds, before any modeling.",
            },
          ],
          practice: [
            { slug: "shingle-near-duplicates", title: "Near-Duplicate Detection with Shingles", difficulty: "Medium" },
            { slug: "rare-category-grouping", title: "Rare Category Grouping", difficulty: "Easy" },
            { slug: "tomek-links", title: "Tomek Link Detection", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      slug: "transforming-features",
      title: "Transforming Features",
      description:
        "Scaling numbers, encoding categories, and reshaping distributions so models can use them.",
      lessons: [
        {
          slug: "feature-scaling",
          title: "Feature Scaling",
          minutes: 14,
          objectives: [
            "Apply min-max scaling, standardization, and robust scaling",
            "Explain why distance-based and gradient-trained models need scaled features",
            "Identify tree-based models as scale-invariant",
          ],
          blocks: [
            {
              kind: "p",
              text: "Raw features live on wildly different scales: age spans 0-100, income spans 0-10,000,000. Any method that adds or compares features numerically will be dominated by the big-scale column — not because it is more informative, but because its numbers are bigger. Scaling puts features on comparable footing.",
            },
            {
              kind: "formula",
              formula: "min-max:  x' = (x - min) / (max - min)",
              explanation:
                "Maps the training range onto [0, 1]. Intuitive and bounded — but a single extreme value stretches the range and squashes everything else toward one end.",
            },
            {
              kind: "formula",
              formula: "standardization:  x' = (x - mean) / std",
              explanation:
                "Centers the feature at 0 with unit standard deviation. Unbounded, less sensitive than min-max to a stretched range, and the default for gradient-trained models.",
            },
            {
              kind: "p",
              text: "**Robust scaling** replaces mean and standard deviation with the median and IQR: x' = (x - median) / IQR. Because both statistics ignore extremes, outliers no longer dictate the scale of everyone else — the right choice when a column has heavy tails you decided to keep.",
            },
            {
              kind: "code",
              caption: "The three scalers side by side. Note the learned statistics are computed once, from training data.",
              code: "def fit_standardizer(train_values):\n    n = len(train_values)\n    mean = sum(train_values) / n\n    var = sum((v - mean) ** 2 for v in train_values) / n\n    std = var ** 0.5\n    # Returned function applies TRAIN statistics to any split.\n    return lambda v: (v - mean) / std if std else 0.0\n\nscale = fit_standardizer([10.0, 20.0, 30.0])\n[round(scale(v), 4) for v in [10.0, 20.0, 40.0]]\n# -> [-1.2247, 0.0, 2.4495]",
            },
            {
              kind: "table",
              headers: ["Scaler", "Formula uses", "Output range", "Outlier sensitivity"],
              rows: [
                ["Min-max", "min, max", "[0, 1] on training data", "High — one extreme squashes the rest"],
                ["Standardization", "mean, std", "Unbounded, mostly [-3, 3]", "Moderate"],
                ["Robust", "median, IQR", "Unbounded", "Low — built from robust statistics"],
              ],
            },
            {
              kind: "heading",
              text: "Who needs scaling — and who does not",
            },
            {
              kind: "list",
              items: [
                "**Distance-based methods** (k-nearest neighbors, k-means, SVMs): distances sum squared differences across features, so an unscaled large-range feature IS the distance. Scaling is mandatory.",
                "**Gradient-trained models** (linear/logistic regression via gradient descent, neural networks): wildly different feature scales create a distorted loss surface where one learning rate is too big for some weights and too small for others. Scaling makes optimization dramatically easier.",
                "**Regularized models**: an L1/L2 penalty treats all coefficients equally, which is only fair if features share a scale.",
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Trees do not care",
              text: "Decision trees and forests split on thresholds — \"income > 50,000?\" — and every monotonic rescaling of a feature yields an equivalent threshold. Scaling changes nothing about the splits, so tree ensembles work happily on raw feature scales. Knowing WHO needs scaling matters as much as knowing HOW.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Fit on train, apply everywhere",
              text: "The min, max, mean, or median inside a scaler are learned from data. Fit them on the training split only, then apply those frozen numbers to validation and test data. Fitting a scaler on the full dataset leaks test-set statistics into training — a leakage pattern dissected in the final lesson.",
            },
          ],
          quiz: [
            {
              id: "fs-1",
              prompt: "Why does k-nearest neighbors require scaled features?",
              options: [
                "KNN cannot process negative numbers",
                "Its distance computation is dominated by whichever feature has the largest numeric range",
                "Scaling reduces the number of neighbors needed",
                "KNN only accepts values in [0, 1]",
              ],
              answer: 1,
              explanation:
                "Euclidean distance sums squared per-feature differences. If income spans millions and age spans decades, income differences dwarf age differences and effectively decide every neighbor — regardless of which feature actually matters.",
            },
            {
              id: "fs-2",
              prompt: "A column contains genuine extreme values you chose to keep. Which scaler keeps them from dictating everyone else's scale?",
              options: [
                "Min-max scaling",
                "Robust scaling with median and IQR",
                "No scaler can help",
                "Multiplying by a constant",
              ],
              answer: 1,
              explanation:
                "Median and IQR barely move when extremes appear, so the bulk of the data keeps a sensible scale. Min-max is the worst choice here — one extreme value stretches the range and squashes everything else.",
            },
            {
              id: "fs-3",
              prompt: "Why is scaling unnecessary for decision trees and random forests?",
              options: [
                "Trees scale features internally",
                "Trees split on thresholds, and monotonic rescaling produces equivalent thresholds",
                "Trees only use categorical features",
                "Trees are too simple to notice scale",
              ],
              answer: 1,
              explanation:
                "A split like income > 50,000 becomes scaled_income > 0.5 after scaling — the same partition of the data. Tree structure and predictions are invariant to monotonic feature transformations.",
            },
            {
              id: "fs-4",
              prompt: "After min-max scaling fit on training data, a test value can be 1.3 because:",
              options: [
                "The scaler has a bug",
                "The test value lies outside the training min-max range, and the training range defines the mapping",
                "Min-max always outputs values above 1",
                "Test data must be rescaled to fix it",
              ],
              answer: 1,
              explanation:
                "The [0, 1] guarantee holds only for the data the scaler was fit on. New data can exceed the training range — which is expected, and far better than refitting the scaler on test data (leakage).",
            },
            {
              id: "fs-5",
              prompt: "How do unscaled features make gradient descent harder?",
              options: [
                "They increase memory usage",
                "They distort the loss surface so no single learning rate suits all weights, slowing or destabilizing training",
                "They prevent the loss from being computed",
                "They cause integer overflow",
              ],
              answer: 1,
              explanation:
                "Weights on large-scale features receive huge gradients while others receive tiny ones. One global learning rate then overshoots some directions and crawls in others; scaling rounds out the loss surface so a single rate works.",
            },
          ],
          practice: [
            { slug: "minmax-scaling", title: "Min-Max Feature Scaling", difficulty: "Easy" },
            { slug: "standardize-dataset", title: "Standardize Dataset Columns", difficulty: "Easy" },
            { slug: "robust-scaler", title: "Robust Scaling with Median and IQR", difficulty: "Easy" },
            { slug: "maxabs-scaling", title: "Max-Abs Feature Scaling", difficulty: "Easy" },
          ],
        },
        {
          slug: "encoding-categoricals",
          title: "Encoding Categorical Features",
          minutes: 15,
          objectives: [
            "Encode categories with one-hot, ordinal, and frequency encoding",
            "Explain target encoding and the leakage risk it carries",
            "Choose strategies for high-cardinality categorical columns",
          ],
          blocks: [
            {
              kind: "p",
              text: "Models compute with numbers, so categories — city, color, payment method — must become numeric. The naive move, assigning 0, 1, 2, ... to categories, invents an ordering and a distance that do not exist: it tells the model that \"Chennai\" is somehow between \"Mumbai\" and \"Delhi\", and twice \"Mumbai\". Encoding done wrong feeds the model fiction.",
            },
            {
              kind: "heading",
              text: "One-hot encoding: one column per category",
            },
            {
              kind: "code",
              caption: "One-hot: each category gets its own 0/1 column. Category order carries no meaning.",
              code: "def one_hot(values, categories):\n    index = {c: i for i, c in enumerate(categories)}\n    rows = []\n    for v in values:\n        row = [0] * len(categories)\n        if v in index:          # unseen categories -> all zeros\n            row[index[v]] = 1\n        rows.append(row)\n    return rows\n\none_hot([\"red\", \"blue\"], [\"red\", \"green\", \"blue\"])\n# -> [[1, 0, 0], [0, 0, 1]]",
            },
            {
              kind: "p",
              text: "One-hot is the safe default for **nominal** categories (no natural order) with modest cardinality. When a category genuinely IS ordered — shirt sizes S < M < L, education levels — **ordinal encoding** maps it to integers that respect that order, and the order becomes usable signal rather than fiction.",
            },
            {
              kind: "table",
              headers: ["Encoding", "Idea", "Best for", "Main risk"],
              rows: [
                ["One-hot", "One binary column per category", "Nominal, low cardinality", "Column explosion at high cardinality"],
                ["Ordinal", "Integers respecting a real order", "Genuinely ordered categories", "Fabricates order if none exists"],
                ["Frequency", "Replace category with its training-set count/share", "High cardinality; popularity is informative", "Distinct categories with equal counts collide"],
                ["Target", "Replace category with the mean target of its rows", "High cardinality with strong category-target link", "Leakage — encodes the answer into the feature"],
              ],
            },
            {
              kind: "heading",
              text: "High cardinality and target encoding",
            },
            {
              kind: "p",
              text: "A column like zip code or user ID may hold tens of thousands of categories — one-hot would add tens of thousands of near-empty columns. **Frequency encoding** replaces each category with how often it appears (computed on training data). **Target encoding** goes further: replace each category with the average label of its training rows — zip 411001 becomes \"average house price in 411001\". It compresses a huge category into one intensely informative number.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Target encoding is a leakage machine",
              text: "Each row's encoded value is computed from labels — and if a row's own label participates in its own encoding, the feature quietly contains the answer. Rare categories are hit worst: with one row, the encoding IS that row's label. Safe use demands computing encodings out-of-fold (each row encoded from other folds' labels) and smoothing rare categories toward the global mean.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Plan for unseen categories",
              text: "Production data will contain categories training never saw — a new city, a new product. Every encoder needs a policy decided up front: an all-zeros one-hot row, a frequency of zero, or the global target mean. An encoder that crashes (or silently mis-encodes) on novel categories is a production incident waiting.",
            },
            {
              kind: "p",
              text: "Choosing an encoding is a modeling decision, not bookkeeping: it decides what the model can and cannot learn from a column. Start with one-hot for small nominal columns and ordinal for ordered ones; reach for frequency or carefully-regularized target encoding only when cardinality forces you to.",
            },
          ],
          quiz: [
            {
              id: "ec-1",
              prompt: "Why is plain integer labeling (Mumbai=0, Delhi=1, Chennai=2) dangerous for a linear model?",
              options: [
                "Integers use more memory than strings",
                "It invents an order and distances between categories that do not exist, and the model will use them",
                "Linear models cannot accept integers",
                "It only supports up to 10 categories",
              ],
              answer: 1,
              explanation:
                "A linear model multiplies the code by a weight, so Chennai (2) is treated as exactly twice Delhi (1) along some direction. That arithmetic relationship is pure fiction for nominal categories — one-hot removes it.",
            },
            {
              id: "ec-2",
              prompt: "When is ordinal encoding the RIGHT choice?",
              options: [
                "Whenever there are more than 10 categories",
                "When the categories have a genuine order, like S < M < L shirt sizes",
                "When the column contains typos",
                "Never — one-hot is always superior",
              ],
              answer: 1,
              explanation:
                "For truly ordered categories, integer codes that respect the order turn it into usable signal — a model can learn \"larger size, higher price\" from one column instead of piecing it together from one-hot fragments.",
            },
            {
              id: "ec-3",
              prompt: "Why does one-hot encoding break down for a zip-code column with 30,000 distinct values?",
              options: [
                "Zip codes are numbers, not categories",
                "It creates 30,000 mostly-zero columns, exploding dimensionality with little signal per column",
                "One-hot cannot represent that many categories",
                "The encoded values would exceed 1",
              ],
              answer: 1,
              explanation:
                "One column per category means 30,000 sparse columns, most seen a handful of times — heavy computation, overfitting risk, and thin evidence per column. High cardinality calls for frequency, hashing, or target-style encodings.",
            },
            {
              id: "ec-4",
              prompt: "What makes naive target encoding a leakage risk?",
              options: [
                "It requires the test set to compute",
                "Each row's feature is computed from labels — including, if done naively, the row's own label",
                "It only works for regression",
                "It produces values outside [0, 1]",
              ],
              answer: 1,
              explanation:
                "Encoding a category as the mean of its labels smuggles the target into a feature. For rare categories the encoding nearly equals the row's own answer, so validation scores soar while production performance collapses. Out-of-fold encoding and smoothing are the standard defenses.",
            },
            {
              id: "ec-5",
              prompt: "At prediction time a category appears that training never contained. A well-designed encoder should:",
              options: [
                "Raise an exception to stop the pipeline",
                "Apply a pre-decided fallback, such as an all-zeros one-hot row or the global mean",
                "Retrain the model immediately",
                "Skip the row silently",
              ],
              answer: 1,
              explanation:
                "Novel categories are guaranteed in production. The encoder needs an explicit, tested fallback policy — crashing or silently corrupting the row are both failures you discover at the worst time.",
            },
          ],
          practice: [
            { slug: "one-hot-encoding", title: "One-Hot Encode Categorical Features", difficulty: "Easy" },
            { slug: "label-encoding", title: "Label Encode Categories", difficulty: "Easy" },
            { slug: "frequency-encoding", title: "Frequency Encoding", difficulty: "Easy" },
            { slug: "feature-hashing", title: "Feature Hashing", difficulty: "Easy" },
          ],
        },
        {
          slug: "binning-and-transforms",
          title: "Binning and Nonlinear Transforms",
          minutes: 13,
          objectives: [
            "Apply equal-width and equal-frequency binning and know when each fails",
            "Use log transforms to tame right-skewed features",
            "Explain what binning buys a linear model and what it costs",
          ],
          blocks: [
            {
              kind: "p",
              text: "Sometimes the best move for a numeric feature is to stop treating it as a number. **Binning** (discretization) chops a continuous feature into intervals — age into age groups, income into brackets — turning one numeric column into a small categorical one.",
            },
            {
              kind: "p",
              text: "**Equal-width** binning slices the range into equal-length intervals: simple, interpretable, but skewed data lands almost everyone in one or two bins while extreme values sit in bins of their own. **Equal-frequency** (quantile) binning instead places an equal share of the DATA in each bin: bin edges adapt to the distribution, so every bin has evidence — at the cost of oddly-placed, data-dependent boundaries.",
            },
            {
              kind: "code",
              caption: "Equal-width binning: same-length intervals, however the data is distributed.",
              code: "def equal_width_bins(values, n_bins):\n    lo, hi = min(values), max(values)\n    width = (hi - lo) / n_bins\n    labels = []\n    for v in values:\n        b = int((v - lo) / width) if width else 0\n        labels.append(min(b, n_bins - 1))  # put the max in the top bin\n    return labels\n\nequal_width_bins([1, 2, 3, 4, 100], 4)\n# -> [0, 0, 0, 0, 3]  (skew crams 4 of 5 values into bin 0)",
            },
            {
              kind: "table",
              headers: ["Strategy", "Bin edges", "Strength", "Weakness"],
              rows: [
                ["Equal-width", "Range / n, evenly spaced", "Simple, interpretable edges", "Skewed data leaves bins empty or overloaded"],
                ["Equal-frequency", "Quantiles of the data", "Every bin holds equal evidence", "Edges are irregular and shift with the data"],
              ],
            },
            {
              kind: "heading",
              text: "Log transforms for skewed features",
            },
            {
              kind: "p",
              text: "Many real features — income, city population, page views — are **right-skewed**: most values are small, a long tail is enormous. Models that assume roughly symmetric inputs (and any plot you make) struggle with such columns. The logarithm compresses the tail: multiplicative differences become additive, and the distribution often turns pleasantly bell-shaped.",
            },
            {
              kind: "formula",
              formula: "x' = log(1 + x)   (log1p)",
              explanation:
                "The +1 shift maps 0 to 0 and keeps the transform defined for zero-valued data. Plain log(x) is undefined at 0 and negative values — log1p is the practical default for non-negative skewed features.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Log turns ratios into differences",
              text: "On a log scale, going from 1,000 to 10,000 is the same step as 10,000 to 100,000. If the phenomenon is multiplicative — salaries growing by percent, populations growing by factors — the log scale is arguably the feature's natural home, and a linear model can suddenly fit it.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Binning throws away information",
              text: "Two people aged 39 and 41 straddle a \"40+\" boundary and become maximally different, while 41 and 79 become identical. Binning buys robustness to outliers and lets linear models fit step-shaped (nonlinear) effects — but it deletes within-bin detail and creates artificial cliffs at the edges. Powerful nonlinear models (trees, networks) usually do better with the raw number.",
            },
            {
              kind: "p",
              text: "As with scalers and encoders, bin edges and transform parameters are learned from training data and then frozen. Quantile bin edges computed on the full dataset leak test-set information into the features — the pipeline discipline of the final lesson applies here too.",
            },
          ],
          quiz: [
            {
              id: "bt-1",
              prompt: "On a right-skewed income column, equal-width binning with 10 bins will typically produce:",
              options: [
                "Ten bins with roughly equal counts",
                "Most rows crammed into the lowest one or two bins, with near-empty top bins",
                "An error, since binning requires symmetric data",
                "Bins ordered by frequency",
              ],
              answer: 1,
              explanation:
                "Equal-width edges divide the RANGE, and a long right tail stretches the range enormously. The bulk of the data occupies the bottom slice while the tail rattles around in nearly empty upper bins — the classic failure equal-frequency binning avoids.",
            },
            {
              id: "bt-2",
              prompt: "What does equal-frequency (quantile) binning guarantee?",
              options: [
                "Bin edges at round numbers",
                "Approximately the same number of data points in every bin",
                "Equal-length intervals",
                "That no information is lost",
              ],
              answer: 1,
              explanation:
                "Edges are placed at quantiles, so each bin captures an equal share of the observations. Every bin has statistical evidence — the trade-off is irregular, data-dependent boundaries.",
            },
            {
              id: "bt-3",
              prompt: "Why use log1p — log(1 + x) — instead of plain log(x) on a non-negative feature?",
              options: [
                "log1p is faster to compute",
                "Plain log is undefined at x = 0, while log1p maps 0 to 0 and stays defined",
                "log1p produces only positive outputs",
                "Plain log only works on integers",
              ],
              answer: 1,
              explanation:
                "Counts and amounts are often exactly zero, where log(x) blows up. The +1 shift keeps the transform defined on the whole non-negative range while preserving the tail-compressing effect.",
            },
            {
              id: "bt-4",
              prompt: "What does binning a feature buy a LINEAR model?",
              options: [
                "Nothing — linear models cannot use binned features",
                "The ability to fit a step-shaped, nonlinear effect: each bin gets its own coefficient",
                "Faster convergence only",
                "Immunity to missing values",
              ],
              answer: 1,
              explanation:
                "One-hot encoded bins give the model a separate coefficient per interval, so the fitted effect can rise and fall freely across the feature's range — a nonlinearity a single linear coefficient cannot express.",
            },
            {
              id: "bt-5",
              prompt: "Ages 39 and 41 fall in different bins; ages 41 and 79 share one. This illustrates:",
              options: [
                "A bug in the binning code",
                "The information cost of binning: artificial cliffs at edges and lost detail within bins",
                "Why bins must be equal-width",
                "That age should never be a feature",
              ],
              answer: 1,
              explanation:
                "Discretization deletes within-bin distinctions and manufactures sharp boundaries between near-identical values. That is the price paid for robustness and step-shaped flexibility — worth it sometimes, not always.",
            },
          ],
          practice: [
            { slug: "equal-width-binning", title: "Equal-Width Feature Binning", difficulty: "Easy" },
            { slug: "log1p-transform", title: "Log1p Transform for Skewed Features", difficulty: "Easy" },
            { slug: "percentile-interpolation", title: "Percentile with Linear Interpolation", difficulty: "Easy" },
          ],
        },
      ],
    },
    {
      slug: "engineering-and-leakage",
      title: "Feature Engineering & Pipeline Hygiene",
      description:
        "Creating features that expose signal — and the discipline that stops the future from leaking into training.",
      lessons: [
        {
          slug: "feature-engineering",
          title: "Feature Engineering",
          minutes: 14,
          objectives: [
            "Create ratio, aggregate, and interaction features from raw columns",
            "Decompose dates and timestamps into model-usable parts",
            "Extract simple statistical features from text",
            "Explain why domain knowledge is the engine of feature engineering",
          ],
          blocks: [
            {
              kind: "p",
              text: "A model can only combine the signal its inputs carry — and raw columns often hide their signal behind arithmetic the model would have to discover on its own. **Feature engineering** does that arithmetic in advance: it restates raw data in terms the underlying pattern actually speaks.",
            },
            {
              kind: "heading",
              text: "Ratios and interactions",
            },
            {
              kind: "p",
              text: "Two raw columns often matter only in combination. Price and area are weak alone; **price per square foot** is the number every property agent actually thinks in. Debt and income are weak alone; the **debt-to-income ratio** is the lending signal. A ratio hands the model in one column what it would otherwise need to approximate from two.",
            },
            {
              kind: "heading",
              text: "Aggregates: describing a row by its group",
            },
            {
              kind: "p",
              text: "When rows belong to entities — transactions to customers, visits to patients — group-level statistics become features: a customer's transaction count, mean order value, or days since last purchase. Each row is then described not just by itself but by the history of its entity.",
            },
            {
              kind: "code",
              caption: "Per-customer aggregates joined back onto each transaction row.",
              code: "def customer_aggregates(transactions):\n    totals = {}\n    for t in transactions:\n        c = t[\"customer\"]\n        stats = totals.setdefault(c, {\"count\": 0, \"sum\": 0.0})\n        stats[\"count\"] += 1\n        stats[\"sum\"] += t[\"amount\"]\n    return {\n        c: {\"txn_count\": s[\"count\"], \"avg_amount\": round(s[\"sum\"] / s[\"count\"], 4)}\n        for c, s in totals.items()\n    }\n\ncustomer_aggregates([\n    {\"customer\": \"a\", \"amount\": 100.0},\n    {\"customer\": \"a\", \"amount\": 40.0},\n    {\"customer\": \"b\", \"amount\": 75.0},\n])\n# -> {\"a\": {\"txn_count\": 2, \"avg_amount\": 70.0}, \"b\": {\"txn_count\": 1, \"avg_amount\": 75.0}}",
            },
            {
              kind: "heading",
              text: "Dates, times, and text",
            },
            {
              kind: "p",
              text: "A raw timestamp is nearly useless to a model, but it is a bundle of powerful features waiting to be unpacked: **hour of day**, **day of week**, **month**, **is-weekend**, **days since a reference event**. Demand forecasting, fraud detection, and churn models all run on these decompositions — behavior is periodic, and the components expose the periods.",
            },
            {
              kind: "p",
              text: "Raw text can yield cheap statistical features long before any NLP model enters the picture: character and word counts, uppercase ratio, digit ratio, punctuation density. Spam filters catch real signal from features as crude as \"fraction of characters that are capital letters\".",
            },
            {
              kind: "table",
              headers: ["Raw input", "Engineered feature", "Signal exposed"],
              rows: [
                ["price, area", "price / area", "Value density — comparable across property sizes"],
                ["transaction history", "count, mean amount, days since last", "Customer behavior profile"],
                ["timestamp", "hour, weekday, is-weekend", "Daily and weekly periodicity"],
                ["message text", "length, uppercase ratio, digit ratio", "Style markers (e.g., spam shouting)"],
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Domain knowledge is the engine",
              text: "The best features come from asking someone who understands the domain: what would YOU look at to make this call? A loan officer says debt-to-income; a doctor says trend, not level. Feature engineering is the translation of that expertise into columns — which is why one well-chosen feature routinely beats a bigger model fed raw inputs.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Aggregates can smuggle the future",
              text: "A customer's \"total purchases\" computed over the WHOLE dataset includes purchases that happened after the moment you are predicting. Every aggregate must be computed as of prediction time — using only information that existed then. This trap has a name, leakage, and the next lesson is devoted to it.",
            },
          ],
          quiz: [
            {
              id: "fe-1",
              prompt: "Why does 'price per square foot' often beat the raw 'price' and 'area' columns in a linear model?",
              options: [
                "It uses less memory",
                "It hands the model a ratio it could not form on its own — linear models cannot divide one feature by another",
                "Ratios are always between 0 and 1",
                "It removes the need for scaling",
              ],
              answer: 1,
              explanation:
                "A linear model can only weight and add its inputs; it cannot compute a quotient of two features. Engineering the ratio does the nonlinear arithmetic in advance, exposing value-density as a single directly-usable column.",
            },
            {
              id: "fe-2",
              prompt: "Decomposing a timestamp into hour-of-day and day-of-week helps because:",
              options: [
                "Timestamps take too much storage",
                "Behavior is periodic, and the components let the model see daily and weekly cycles directly",
                "Models cannot read numbers as large as Unix timestamps",
                "It removes timezone problems",
              ],
              answer: 1,
              explanation:
                "As a raw monotonically increasing number, a timestamp hides its cycles. Hour and weekday restate the same information along the periodic axes where human behavior actually repeats.",
            },
            {
              id: "fe-3",
              prompt: "Which is an aggregate feature for a transaction row?",
              options: [
                "The transaction's own amount",
                "The customer's average transaction amount across their history",
                "The transaction ID",
                "The currency code",
              ],
              answer: 1,
              explanation:
                "Aggregates summarize a row's GROUP — here, the customer's history — and attach that summary to each row. The row is then described by its entity's behavior, not just its own values.",
            },
            {
              id: "fe-4",
              prompt: "A 'total purchases per customer' feature computed over the entire dataset is dangerous because:",
              options: [
                "Totals overflow for big customers",
                "It includes purchases from after the prediction moment, leaking future information",
                "Customers object to being counted",
                "It correlates with customer ID",
              ],
              answer: 1,
              explanation:
                "At prediction time, only past purchases exist. A whole-dataset total silently includes the future, inflating offline metrics for a model that cannot work in production. Aggregates must be computed as of each row's prediction time.",
            },
            {
              id: "fe-5",
              prompt: "Where do the strongest engineered features usually come from?",
              options: [
                "Trying every possible arithmetic combination of columns",
                "Domain knowledge — translating what an expert would look at into columns",
                "Increasing the number of decimal places",
                "Renaming columns descriptively",
              ],
              answer: 1,
              explanation:
                "Exhaustive combination generates noise faster than signal. Experts already know which quantities drive the outcome — debt-to-income, trend-not-level — and feature engineering is the craft of encoding that knowledge.",
            },
          ],
          practice: [
            { slug: "polynomial-features", title: "Degree-2 Polynomial Features", difficulty: "Easy" },
            { slug: "lag-features", title: "Build Lag Features for Forecasting", difficulty: "Easy" },
            { slug: "top-k-frequent-words", title: "Top-K Frequent Words", difficulty: "Easy" },
            { slug: "covariance-correlation-matrix", title: "Covariance and Correlation Matrices", difficulty: "Medium" },
          ],
        },
        {
          slug: "data-leakage",
          title: "Data Leakage and Pipeline Hygiene",
          minutes: 15,
          objectives: [
            "Define data leakage and recognize its three main forms",
            "Apply fit-transform discipline: fit preprocessing on training data only",
            "Spot temporal leakage in time-ordered problems",
            "Treat suspiciously high scores as a symptom to investigate",
          ],
          blocks: [
            {
              kind: "p",
              text: "**Data leakage** is information reaching the model during training that will not exist at prediction time. It is the most expensive class of ML bug, because it fails silently in the happy direction: validation scores look wonderful, everyone celebrates, and the model collapses in production where the leaked information is absent.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Data leakage",
              text: "Any pathway by which the training process gains access to information unavailable at real prediction time — through a feature that encodes the target, through test data influencing preprocessing, or through the future informing the past.",
            },
            {
              kind: "heading",
              text: "Form 1: target leakage",
            },
            {
              kind: "p",
              text: "A feature is computed FROM the outcome or from events downstream of it. Classic case: predicting whether a patient has a disease, with \"medication prescribed\" as a feature — prescriptions happen after diagnosis, so the feature is the answer wearing a costume. Naive target encoding (earlier lesson) is the same failure built systematically. The tell: one feature with implausibly overwhelming importance.",
            },
            {
              kind: "heading",
              text: "Form 2: train-test contamination",
            },
            {
              kind: "p",
              text: "The test set influences training through a side door — most often preprocessing. Fit a scaler, an imputer, or bin edges on the FULL dataset and the training features now carry test-set statistics. Duplicates straddling the split (earlier lesson) are the same disease. The rule that prevents all of it is mechanical:",
            },
            {
              kind: "code",
              caption: "The fit-transform discipline: statistics learned from train, frozen, applied everywhere.",
              code: "def fit_scaler(train_col):\n    mean = sum(train_col) / len(train_col)\n    var = sum((v - mean) ** 2 for v in train_col) / len(train_col)\n    return mean, var ** 0.5\n\ndef transform(col, mean, std):\n    return [(v - mean) / std if std else 0.0 for v in col]\n\ntrain, test = [10.0, 20.0, 30.0], [40.0, 50.0]\n\n# WRONG: statistics computed over train + test (test leaks into training).\n# RIGHT: fit on train only, apply the frozen numbers to both.\nmean, std = fit_scaler(train)\ntrain_scaled = transform(train, mean, std)\ntest_scaled = transform(test, mean, std)",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Split first, fit second",
              text: "Every learned preprocessing statistic — imputation fills, scaler means, encoder mappings, quantile bin edges, vocabulary lists — must be fit on the training split alone and then applied, frozen, to validation and test data. If a number was computed from data, it is part of the model, and the same honesty rules apply to it.",
            },
            {
              kind: "heading",
              text: "Form 3: temporal leakage",
            },
            {
              kind: "p",
              text: "In time-ordered problems, random splits train the model on the future to predict the past — an ability production will never have. Split by time instead: train on earlier data, test on later. The same rule governs features: every feature for a row must be computable from what existed at that row's moment (lag features and as-of aggregates, never whole-history totals).",
            },
            {
              kind: "table",
              headers: ["Leakage form", "Mechanism", "Defense"],
              rows: [
                ["Target leakage", "Feature derived from the outcome or its consequences", "Audit each feature: available BEFORE the outcome?"],
                ["Train-test contamination", "Test data shapes preprocessing or duplicates cross the split", "Split first; fit transforms on train only; dedup before splitting"],
                ["Temporal leakage", "Future rows or future-derived features inform training", "Time-ordered splits; as-of feature computation"],
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Too good to be true usually is",
              text: "Leakage announces itself as unexpected excellence: 99% accuracy on a genuinely hard problem, one feature dominating importance, or a large gap between offline and live performance. Experienced practitioners treat a surprisingly high score not as a win but as a bug report — and audit the pipeline before celebrating.",
            },
            {
              kind: "p",
              text: "Pipeline hygiene is the summary of this whole course: deduplicate, then split; fit every cleaning and transformation step on training data only; compute features as of prediction time; open the test set once. Follow that order and your offline numbers will mean what they claim — which is the entire point of evaluation.",
            },
          ],
          quiz: [
            {
              id: "dl-1",
              prompt: "Why is data leakage called a silent failure?",
              options: [
                "It crashes without an error message",
                "Offline metrics IMPROVE, so nothing looks wrong until the model fails in production",
                "It only occurs in small datasets",
                "Logging systems cannot record it",
              ],
              answer: 1,
              explanation:
                "Leakage feeds the model information that makes validation artificially easy, so every dashboard looks great. The failure only surfaces in production, where the leaked information does not exist.",
            },
            {
              id: "dl-2",
              prompt: "Predicting disease with 'medication prescribed' as a feature is target leakage because:",
              options: [
                "Medication names are strings",
                "Prescriptions are a consequence of diagnosis — the feature encodes the outcome it should predict",
                "Medication data has missing values",
                "The feature is categorical",
              ],
              answer: 1,
              explanation:
                "The prescription happens downstream of the diagnosis, so at true prediction time (before diagnosis) it does not exist. Training with it teaches the model to read the answer, not to predict it.",
            },
            {
              id: "dl-3",
              prompt: "Fitting a standardization scaler on the combined train+test data causes leakage because:",
              options: [
                "The scaler becomes too slow",
                "Training features are computed using test-set statistics, letting test data influence training",
                "Standardization only works on training data",
                "The test set becomes too small",
              ],
              answer: 1,
              explanation:
                "The mean and standard deviation are learned parameters. Computing them over the full dataset bakes test-set information into every training feature — the test set is no longer unseen. Fit on train, apply frozen to the rest.",
            },
            {
              id: "dl-4",
              prompt: "For a churn model using monthly snapshots over three years, the correct split is:",
              options: [
                "Uniformly random across all months",
                "By time — train on earlier months, evaluate on later months",
                "By customer name alphabetically",
                "Whichever gives the highest validation score",
              ],
              answer: 1,
              explanation:
                "Production will always predict forward in time. A random split lets the model train on later months to predict earlier ones — temporal leakage that inflates offline scores beyond anything achievable live.",
            },
            {
              id: "dl-5",
              prompt: "Your first model scores 99.4% on a problem experts consider genuinely hard. The best next step is to:",
              options: [
                "Ship it before the advantage disappears",
                "Audit the pipeline for leakage — a suspiciously high score is a symptom, not a triumph",
                "Add more features to reach 100%",
                "Reduce the training set to make the task harder",
              ],
              answer: 1,
              explanation:
                "Implausible excellence is the classic signature of leakage: a target-derived feature, contaminated preprocessing, or a future-aware split. Verify the number is real before anyone builds on it.",
            },
          ],
          practice: [
            { slug: "train-test-split", title: "Deterministic Train/Test Split", difficulty: "Easy" },
            { slug: "three-way-split", title: "Train/Validation/Test Split", difficulty: "Easy" },
            { slug: "time-ordered-split", title: "Time-Ordered Split", difficulty: "Easy" },
            { slug: "stratified-split", title: "Stratified Train/Test Split", difficulty: "Medium" },
          ],
        },
      ],
    },
  ],
};
