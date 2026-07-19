import type { Course } from "../types";

export const unsupervisedLearning: Course = {
  slug: "unsupervised-learning",
  title: "Unsupervised Learning",
  tagline: "Finding structure when nobody gives you the answers",
  level: "Intermediate",
  accent: "from-rose-500 to-pink-600",
  description:
    "Labels are expensive; data is not. Learn to extract groups, directions, similarities, and oddities from raw unlabeled data — clustering, PCA, distance metrics, anomaly detection, and the ideas behind recommender systems.",
  modules: [
    {
      slug: "clustering",
      title: "Finding Groups",
      description:
        "K-means, hierarchical and density-based clustering, and the hard problem of judging clusters without labels.",
      lessons: [
        {
          slug: "k-means",
          title: "K-Means Clustering",
          minutes: 15,
          objectives: [
            "State the k-means objective and walk through Lloyd's algorithm",
            "Explain why initialization matters and how k-means++ fixes it",
            "Choose k using the elbow method and silhouette scores",
          ],
          blocks: [
            {
              kind: "p",
              text: "Clustering asks: which examples belong together? **K-means** answers with the simplest possible commitment — pick k points called **centroids**, and assign every example to its nearest centroid. A good clustering is one where examples sit close to their assigned centroid.",
            },
            {
              kind: "formula",
              formula: "J = Σᵢ ‖xᵢ − μ_c(i)‖²",
              explanation:
                "The k-means objective (inertia): the sum of squared distances from each point xᵢ to the centroid μ of its assigned cluster c(i). Training searches for centroids and assignments that minimize J.",
            },
            {
              kind: "p",
              text: "Minimizing J exactly is computationally intractable, so k-means uses **Lloyd's algorithm** — an alternating loop that improves J at every step. Freeze the centroids and the best move is to reassign each point to its nearest centroid. Freeze the assignments and the best move is to place each centroid at the mean of its points. Alternate until nothing changes.",
            },
            {
              kind: "code",
              caption: "One iteration of Lloyd's algorithm in plain Python.",
              code: "def assign(points, centroids):\n    def nearest(p):\n        dists = [sum((a - b) ** 2 for a, b in zip(p, c))\n                 for c in centroids]\n        return dists.index(min(dists))\n    return [nearest(p) for p in points]\n\ndef update(points, labels, k):\n    centroids = []\n    for j in range(k):\n        members = [p for p, l in zip(points, labels) if l == j]\n        centroids.append([sum(col) / len(members)\n                          for col in zip(*members)])\n    return centroids\n\n# Repeat assign -> update until labels stop changing.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Convergence is not optimality",
              text: "Lloyd's algorithm always converges, but only to a local minimum of J. Start from bad centroids and it happily settles on a bad clustering — two centroids splitting one true group while another group goes unrepresented.",
            },
            {
              kind: "heading",
              text: "Initialization and k-means++",
            },
            {
              kind: "p",
              text: "Because the outcome depends on the starting centroids, purely random initialization is risky: random picks tend to land in dense regions, sometimes several in the same one. **k-means++** fixes this by spreading the seeds out — pick the first centroid at random, then pick each next centroid with probability proportional to its squared distance from the nearest centroid chosen so far. Far-away regions become likely picks, so every true group tends to get a seed. In practice you also run the whole algorithm several times and keep the run with the lowest J.",
            },
            {
              kind: "heading",
              text: "Choosing k",
            },
            {
              kind: "p",
              text: "K-means never chooses k for you, and J alone cannot: adding clusters always lowers inertia, all the way to zero at k = n. Two standard tools guide the choice. The **elbow method** plots J against k and looks for the bend where extra clusters stop paying for themselves. The **silhouette score** measures, per point, how much closer it is to its own cluster than to the next-nearest one — pick the k that maximizes the average.",
            },
            {
              kind: "table",
              headers: ["Property", "Consequence"],
              rows: [
                ["Objective uses squared Euclidean distance", "Prefers round, similarly sized clusters; feature scaling matters"],
                ["Alternating optimization", "Fast, but converges to local minima — restart several times"],
                ["Centroid = mean of members", "Sensitive to outliers, which drag the mean"],
                ["k is fixed up front", "Must be chosen externally (elbow, silhouette, domain knowledge)"],
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Scale before you cluster",
              text: "K-means lives and dies by Euclidean distance. If one feature is income in rupees and another is age in years, income dominates every distance and effectively decides the clustering alone. Standardize features first unless their scales are genuinely comparable.",
            },
          ],
          quiz: [
            {
              id: "km-1",
              prompt: "What does the k-means objective (inertia) measure?",
              options: [
                "The number of clusters in the data",
                "The sum of squared distances from each point to its assigned centroid",
                "The distance between the two closest centroids",
                "The fraction of points assigned to the largest cluster",
              ],
              answer: 1,
              explanation:
                "Inertia J sums the squared distance from every point to the centroid of its cluster. Lloyd's algorithm alternates two steps, each of which can only decrease this quantity.",
            },
            {
              id: "km-2",
              prompt: "In Lloyd's algorithm, what happens in the update step after points are assigned?",
              options: [
                "Each centroid moves to the mean of the points assigned to it",
                "The number of clusters k is increased by one",
                "Outliers are removed from the dataset",
                "Each point moves toward its centroid",
              ],
              answer: 0,
              explanation:
                "With assignments frozen, the centroid position that minimizes the summed squared distance to a cluster's members is exactly their mean — hence the name k-means.",
            },
            {
              id: "km-3",
              prompt: "Why is k-means++ preferred over purely random initialization?",
              options: [
                "It guarantees the global minimum of the objective",
                "It removes the need to choose k",
                "It spreads initial centroids apart, making it likely every true group gets a seed",
                "It runs in fewer iterations by skipping the assignment step",
              ],
              answer: 2,
              explanation:
                "k-means++ picks each new seed with probability proportional to squared distance from existing seeds, so distant regions are favored. It improves expected quality substantially, but it is still a randomized heuristic — no global-optimum guarantee.",
            },
            {
              id: "km-4",
              prompt: "Why can't you choose k by simply minimizing inertia over all values of k?",
              options: [
                "Inertia cannot be computed for k greater than 10",
                "Inertia always decreases as k grows, reaching zero when every point is its own cluster",
                "Inertia is only defined for two-dimensional data",
                "Inertia increases with k, so it would always pick k = 1",
              ],
              answer: 1,
              explanation:
                "More centroids can only bring points closer to their nearest centroid, so inertia falls monotonically with k. That is why the elbow method looks for diminishing returns instead of a minimum, and why silhouette offers a k-comparable alternative.",
            },
            {
              id: "km-5",
              prompt: "A dataset has features 'income (0–10,000,000)' and 'age (0–100)'. Running k-means directly will:",
              options: [
                "Weight both features equally because k-means normalizes internally",
                "Fail with an error because the scales differ",
                "Cluster almost entirely by income, since it dominates every Euclidean distance",
                "Cluster almost entirely by age, since smaller ranges matter more",
              ],
              answer: 2,
              explanation:
                "Squared Euclidean distance adds per-feature squared differences, so a feature with a vastly larger range contributes almost all of the distance. Standardizing features first restores a balanced comparison.",
            },
          ],
          practice: [
            { slug: "kmeans-fixed-init", title: "K-Means with Fixed Initial Centroids", difficulty: "Medium" },
            { slug: "farthest-first-traversal", title: "Farthest-First Traversal for Centroid Seeding", difficulty: "Medium" },
            { slug: "kmeans-plus-plus", title: "Seeded K-Means++ Initialization", difficulty: "Hard" },
          ],
        },
        {
          slug: "hierarchical-and-density-clustering",
          title: "Hierarchical and Density-Based Clustering",
          minutes: 15,
          objectives: [
            "Describe agglomerative clustering and compare single, complete, and average linkage",
            "Read a dendrogram and cut it to obtain a clustering",
            "Explain DBSCAN's core, border, and noise points and when density beats centroids",
          ],
          blocks: [
            {
              kind: "p",
              text: "K-means commits to one k and to round clusters. Two other families relax those commitments. **Hierarchical clustering** builds every granularity at once — a tree of clusterings from n singletons down to one blob. **Density-based clustering** drops centroids entirely and defines a cluster as a region where points are packed tightly.",
            },
            {
              kind: "heading",
              text: "Agglomerative clustering and linkage",
            },
            {
              kind: "p",
              text: "**Agglomerative** (bottom-up) clustering starts with every point as its own cluster and repeatedly merges the two closest clusters. But what does 'closest' mean for clusters, which contain many points? That choice is the **linkage**, and it shapes the result more than anything else.",
            },
            {
              kind: "table",
              headers: ["Linkage", "Cluster distance", "Tendency"],
              rows: [
                ["Single", "Closest pair of points, one from each cluster", "Finds elongated chains; can merge distinct groups via a thin bridge"],
                ["Complete", "Farthest pair of points", "Compact, similar-diameter clusters; breaks up chains"],
                ["Average", "Mean of all cross-pair distances", "A compromise between the two extremes"],
              ],
            },
            {
              kind: "p",
              text: "The merge history is drawn as a **dendrogram**: leaves are points, and each merge is a joint whose height is the distance at which the merge happened. Cutting the tree horizontally at some height yields a flat clustering — cut low for many small clusters, high for a few large ones. One run gives you every k; you choose the cut afterward, often at the largest vertical gap between merges.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "The tree is the product",
              text: "Hierarchical clustering's real output is the dendrogram itself. For taxonomies — species, documents, product categories — the nested structure is what you wanted, and no single flat clustering could express it.",
            },
            {
              kind: "heading",
              text: "DBSCAN: clusters as dense regions",
            },
            {
              kind: "p",
              text: "**DBSCAN** takes two parameters: a radius **eps** and a count **minPts**. A point with at least minPts neighbors within eps is a **core point** — it sits in a dense region. Clusters grow by connecting core points that lie within eps of each other. A non-core point within eps of a core point is a **border point** and joins that cluster. Everything else is **noise** — labeled as belonging to no cluster at all.",
            },
            {
              kind: "code",
              caption: "Classifying core, border, and noise points.",
              code: "def classify(points, eps, min_pts):\n    def dist(a, b):\n        return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5\n\n    neighbors = [\n        [j for j, q in enumerate(points)\n         if j != i and dist(p, q) <= eps]\n        for i, p in enumerate(points)\n    ]\n    core = {i for i, ns in enumerate(neighbors)\n            if len(ns) + 1 >= min_pts}\n    labels = {}\n    for i in range(len(points)):\n        if i in core:\n            labels[i] = \"core\"\n        elif any(j in core for j in neighbors[i]):\n            labels[i] = \"border\"\n        else:\n            labels[i] = \"noise\"\n    return labels",
            },
            {
              kind: "p",
              text: "Three properties make DBSCAN the tool of choice for certain shapes of data. It discovers the number of clusters itself — no k. It finds **arbitrarily shaped** clusters, because clusters grow by local connectivity rather than proximity to a center: two interleaved crescents that k-means always butchers are trivial for DBSCAN. And it has a built-in notion of noise, so outliers do not distort any cluster.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Density is a global assumption",
              text: "DBSCAN uses one eps for the whole dataset, so it assumes all clusters are roughly equally dense. A dataset with one tight cluster and one diffuse cluster defeats any single eps: small values shatter the diffuse cluster into noise, large values merge everything. Varying-density data needs variants like HDBSCAN or a different approach.",
            },
            {
              kind: "p",
              text: "Choosing between the families: reach for k-means when clusters are compact and roughly round and you want speed at scale; hierarchical when you want the nested structure or cannot fix k in advance; DBSCAN when clusters have irregular shapes, noise is real, and density — not distance to a center — is what defines a group.",
            },
          ],
          quiz: [
            {
              id: "hd-1",
              prompt: "In agglomerative clustering with single linkage, the distance between two clusters is:",
              options: [
                "The distance between their centroids",
                "The distance between their closest pair of points",
                "The distance between their farthest pair of points",
                "The average of all pairwise distances",
              ],
              answer: 1,
              explanation:
                "Single linkage merges clusters based on their nearest cross-cluster pair. This finds chain-like structures but can merge genuinely distinct groups connected by a thin bridge of points.",
            },
            {
              id: "hd-2",
              prompt: "What does the height of a joint in a dendrogram represent?",
              options: [
                "The number of points in the merged cluster",
                "The order in which points arrived in the dataset",
                "The distance between the two clusters at the moment they merged",
                "The silhouette score of the merged cluster",
              ],
              answer: 2,
              explanation:
                "Each merge is drawn at the cluster distance at which it occurred. Cutting the tree below a tall joint keeps its two subtrees as separate clusters — which is why large vertical gaps suggest natural cut points.",
            },
            {
              id: "hd-3",
              prompt: "In DBSCAN, a border point is one that:",
              options: [
                "Has at least minPts neighbors within eps",
                "Is not dense itself but lies within eps of a core point",
                "Lies exactly on the boundary between two clusters",
                "Is farther than eps from every other point",
              ],
              answer: 1,
              explanation:
                "Border points fail the density test (fewer than minPts neighbors) but sit inside a core point's neighborhood, so they attach to that core point's cluster. Points that are neither core nor border are noise.",
            },
            {
              id: "hd-4",
              prompt: "Two interleaved crescent-shaped clusters are separated correctly by DBSCAN but not by k-means. Why?",
              options: [
                "DBSCAN uses a larger number of iterations",
                "K-means cannot handle two-dimensional data",
                "DBSCAN grows clusters through local density connectivity, while k-means assigns by distance to a central point",
                "DBSCAN uses squared distances while k-means does not",
              ],
              answer: 2,
              explanation:
                "K-means partitions space around centroids, which always yields convex regions — a crescent wrapping around another cannot be one. DBSCAN follows chains of nearby dense points, so a cluster can take any shape the density traces out.",
            },
            {
              id: "hd-5",
              prompt: "Which dataset most clearly defeats standard DBSCAN?",
              options: [
                "Clusters with irregular, non-round shapes",
                "Data containing scattered outlier points",
                "One very tight cluster and one very diffuse cluster",
                "Data where the number of clusters is unknown",
              ],
              answer: 2,
              explanation:
                "A single global eps encodes one density threshold. No value fits both a tight and a diffuse cluster: too small shatters the diffuse one into noise, too large merges the two. The other three cases are exactly DBSCAN's strengths.",
            },
          ],
          practice: [
            { slug: "complete-linkage-clustering", title: "Complete-Linkage Agglomerative Clustering", difficulty: "Medium" },
            { slug: "dbscan-clustering", title: "DBSCAN Density Clustering", difficulty: "Medium" },
            { slug: "single-linkage-clustering", title: "Single-Linkage Agglomerative Clustering", difficulty: "Hard" },
          ],
        },
        {
          slug: "evaluating-clusters",
          title: "Evaluating Clusters",
          minutes: 13,
          objectives: [
            "Compute and interpret inertia and the silhouette score",
            "Measure purity when ground-truth labels exist",
            "Explain why clustering evaluation is fundamentally harder than supervised evaluation",
          ],
          blocks: [
            {
              kind: "p",
              text: "Supervised learning has an answer key: compare predictions to labels and count. Clustering has no answer key — that is the point of using it — so evaluation must fall back on indirect evidence. There are two kinds: **internal** metrics that judge the geometry of the clustering itself, and **external** metrics that compare against known labels when, for benchmarking, you happen to have them.",
            },
            {
              kind: "heading",
              text: "Internal metrics: inertia and silhouette",
            },
            {
              kind: "p",
              text: "**Inertia** (within-cluster sum of squares) rewards tight clusters, but it only compares clusterings with the same k — it always improves as k grows. The **silhouette score** fixes that by weighing tightness against separation for each point individually.",
            },
            {
              kind: "formula",
              formula: "s(i) = (b(i) − a(i)) / max(a(i), b(i))",
              explanation:
                "For point i: a(i) is its mean distance to members of its own cluster; b(i) is its mean distance to the nearest other cluster. s ranges from −1 to 1 — near 1 means well placed, near 0 means on a boundary, negative means probably assigned to the wrong cluster.",
            },
            {
              kind: "p",
              text: "Averaging s(i) over all points scores the whole clustering, and because separation enters the formula, silhouette can compare different values of k fairly — unlike inertia. Per-point silhouettes are also diagnostic: a cluster whose members mostly score near zero is a cluster the data does not really support.",
            },
            {
              kind: "heading",
              text: "External metrics: purity",
            },
            {
              kind: "p",
              text: "When benchmark labels exist, **purity** asks: if each cluster votes for its most common true label, what fraction of points end up labeled correctly? Compute it by counting each cluster's majority class and dividing the total by n.",
            },
            {
              kind: "code",
              caption: "Purity: each cluster is credited with its majority label.",
              code: "from collections import Counter\n\ndef purity(cluster_ids, true_labels):\n    clusters = {}\n    for c, t in zip(cluster_ids, true_labels):\n        clusters.setdefault(c, []).append(t)\n    correct = sum(\n        Counter(members).most_common(1)[0][1]\n        for members in clusters.values()\n    )\n    return correct / len(true_labels)\n\n# purity([0, 0, 0, 1, 1], [\"a\", \"a\", \"b\", \"b\", \"b\"])  -> 0.8",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Purity is gameable",
              text: "Assign every point to its own cluster and purity hits 1.0 — each singleton cluster is trivially pure. Purity never punishes fragmentation, so report it alongside the number of clusters, or use metrics that do punish it (adjusted Rand index, normalized mutual information).",
            },
            {
              kind: "heading",
              text: "Why this is genuinely hard",
            },
            {
              kind: "p",
              text: "The deeper issue is that 'the right clustering' is not a property of the data alone. Cluster customers by what they buy or by when they shop and you get two different, equally valid partitions of the same people. Internal metrics cannot arbitrate — they just encode a geometric preference (round, well-separated blobs) that may not match what you care about. Different metrics routinely disagree, and no internal metric can tell you whether the data has any real cluster structure at all versus arbitrary slices of a uniform cloud.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "The end task is the real metric",
              text: "In practice the decisive test is downstream: did clustering the customers improve the campaign? Did grouping the logs speed up triage? Internal metrics are for tuning and sanity checks; usefulness for the task that motivated clustering is the evaluation that matters.",
            },
          ],
          quiz: [
            {
              id: "ec-1",
              prompt: "Why can't inertia be used to compare clusterings with different numbers of clusters?",
              options: [
                "Inertia is only defined for k-means clusterings",
                "Inertia monotonically improves as k grows, so more clusters always look better",
                "Inertia requires ground-truth labels",
                "Inertia is unbounded above",
              ],
              answer: 1,
              explanation:
                "Adding centroids can only reduce each point's distance to its nearest one, so inertia keeps falling as k rises — regardless of whether the extra clusters are meaningful. Silhouette includes separation, which lets it compare across k.",
            },
            {
              id: "ec-2",
              prompt: "A point has silhouette value s(i) = −0.4. What does that suggest?",
              options: [
                "The point is deep inside a well-separated cluster",
                "The point is on average closer to another cluster than to its own — likely misassigned",
                "The point is an outlier far from all clusters",
                "The clustering used too small a value of k",
              ],
              answer: 1,
              explanation:
                "Negative silhouette means a(i) > b(i): the point's mean distance to its own cluster exceeds its mean distance to the nearest other cluster. It would fit better next door.",
            },
            {
              id: "ec-3",
              prompt: "In the silhouette formula, what is b(i)?",
              options: [
                "The distance from point i to its cluster's centroid",
                "The mean distance from point i to points in its own cluster",
                "The mean distance from point i to points in the nearest other cluster",
                "The number of points in cluster i",
              ],
              answer: 2,
              explanation:
                "b(i) measures separation: how far point i is, on average, from its best alternative cluster. a(i) measures cohesion within its own cluster; the score compares the two.",
            },
            {
              id: "ec-4",
              prompt: "How can purity of 1.0 be achieved without learning anything about the data?",
              options: [
                "By putting all points in one cluster",
                "By making every point its own singleton cluster",
                "By shuffling the true labels",
                "By standardizing the features first",
              ],
              answer: 1,
              explanation:
                "A singleton cluster's majority label is its only label, so every singleton is perfectly pure. Purity rewards fragmentation for free — one cluster containing everything would instead score only the overall majority-class fraction.",
            },
            {
              id: "ec-5",
              prompt: "What is the fundamental reason clustering evaluation is harder than supervised evaluation?",
              options: [
                "Clustering algorithms are slower to run",
                "Distances are expensive to compute in high dimensions",
                "There is no single correct answer — multiple valid groupings of the same data can exist",
                "Clustering metrics require larger test sets",
              ],
              answer: 2,
              explanation:
                "Supervised tasks define correctness via labels. Clustering has no such ground truth: the same data supports different legitimate partitions depending on what you care about, and internal metrics merely encode a geometric preference.",
            },
          ],
          practice: [
            { slug: "within-cluster-sse", title: "Within-Cluster Sum of Squares", difficulty: "Medium" },
            { slug: "silhouette-score", title: "Silhouette Score for a Clustering", difficulty: "Medium" },
            { slug: "kmedoids-assignment", title: "K-Medoids Assignment and Cost", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      slug: "structure-and-similarity",
      title: "Structure & Similarity",
      description:
        "Compressing dimensions with PCA, measuring similarity well, and applying both to anomalies and recommendations.",
      lessons: [
        {
          slug: "dimensionality-reduction-pca",
          title: "Dimensionality Reduction and PCA",
          minutes: 15,
          objectives: [
            "Explain PCA as finding directions of maximum variance",
            "Interpret projections, components, and the explained variance ratio",
            "Decide when to standardize features before PCA",
          ],
          blocks: [
            {
              kind: "p",
              text: "High-dimensional data is usually less high-dimensional than it looks. A 100-feature dataset often has features that move together — height and weight, price and tax, pixel and neighboring pixel. **Dimensionality reduction** exploits that redundancy: re-express the data with fewer numbers per example while losing as little information as possible.",
            },
            {
              kind: "p",
              text: "**Principal Component Analysis (PCA)** makes 'as little as possible' precise using variance. It finds the direction in feature space along which the data varies most — the **first principal component**. Then the direction of greatest remaining variance at right angles to the first, and so on. Each component is a unit vector; projecting the (centered) data onto the top k components gives each example k new coordinates.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "Projection",
              text: "The projection of a point onto a direction is its coordinate along that direction: the dot product of the centered point with the direction's unit vector. PCA replaces d original coordinates with k projections onto the top k components.",
            },
            {
              kind: "code",
              caption: "Projecting centered data onto one component direction.",
              code: "def project(points, direction):\n    n, d = len(points), len(points[0])\n    means = [sum(p[j] for p in points) / n for j in range(d)]\n    norm = sum(v * v for v in direction) ** 0.5\n    unit = [v / norm for v in direction]\n    return [\n        sum((p[j] - means[j]) * unit[j] for j in range(d))\n        for p in points\n    ]\n\n# Each point is now summarized by ONE number: its\n# coordinate along the chosen direction.",
            },
            {
              kind: "p",
              text: "Why maximize variance? Because variance is where the information is. A direction along which all examples project to nearly the same value cannot distinguish them — dropping it costs almost nothing. Keeping the top-variance directions keeps the coordinates that separate examples from each other. Equivalently, PCA's top-k projection is the k-dimensional linear summary with the smallest total squared reconstruction error.",
            },
            {
              kind: "heading",
              text: "How many components? Explained variance ratio",
            },
            {
              kind: "p",
              text: "Each component captures a share of the total variance, called its **explained variance ratio**. If the first two components explain 92% of the variance, a 2-D projection preserves 92% of the data's spread. The standard recipe: keep enough components to reach a threshold (say 95%), or plot the ratios and cut where they collapse toward zero.",
            },
            {
              kind: "table",
              headers: ["Component", "Explained variance ratio", "Cumulative"],
              rows: [
                ["PC1", "0.71", "0.71"],
                ["PC2", "0.21", "0.92"],
                ["PC3", "0.05", "0.97"],
                ["PC4", "0.03", "1.00"],
              ],
            },
            {
              kind: "heading",
              text: "Standardize first?",
            },
            {
              kind: "p",
              text: "PCA chases variance, and raw variance depends on units. Measure a length feature in millimeters instead of meters and its variance grows a million-fold — PC1 will simply be that feature, telling you about your unit choices rather than your data. **Standardize** (zero mean, unit variance per feature) when features are in unrelated units, which is the common case. Skip standardization only when features share one meaningful scale — pixel intensities, or readings from identical sensors — and the variance differences are themselves the signal.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Components are linear and can be unreadable",
              text: "Each principal component is a weighted mix of all original features, so 'PC1' rarely has a clean real-world name — a cost when explanations matter. And PCA only finds linear structure: data lying on a curved surface needs nonlinear methods (t-SNE, UMAP, autoencoders). PCA remains the first thing to try because it is fast, deterministic, and often good enough.",
            },
          ],
          quiz: [
            {
              id: "pca-1",
              prompt: "What direction does the first principal component point in?",
              options: [
                "The direction of the feature with the largest range",
                "The direction in feature space along which the projected data has maximum variance",
                "The direction connecting the two farthest points",
                "The direction of the mean of the data",
              ],
              answer: 1,
              explanation:
                "PC1 is the unit vector maximizing the variance of the data's projections onto it. Later components repeat this among directions orthogonal to those already chosen.",
            },
            {
              id: "pca-2",
              prompt: "Why does PCA treat low-variance directions as safe to discard?",
              options: [
                "Low-variance directions always contain measurement noise",
                "Along such directions examples project to nearly identical values, so those coordinates barely distinguish them",
                "Low-variance directions cause numerical overflow",
                "They correspond to categorical features",
              ],
              answer: 1,
              explanation:
                "A coordinate that is almost constant across examples carries little information for telling examples apart; dropping it changes each point's representation very little. That is also why the top-k projection minimizes reconstruction error.",
            },
            {
              id: "pca-3",
              prompt: "PC1 and PC2 have explained variance ratios 0.60 and 0.25. What does keeping only these two components preserve?",
              options: [
                "60% of the total variance",
                "85% of the total variance",
                "25% of the total variance",
                "All variance, since the rest is noise by definition",
              ],
              answer: 1,
              explanation:
                "Explained variance ratios add across components: the 2-D projection retains 0.60 + 0.25 = 85% of the data's total variance. The remaining 15% lives in the discarded directions.",
            },
            {
              id: "pca-4",
              prompt: "When is standardizing features before PCA most important?",
              options: [
                "When all features are pixel intensities on the same 0–255 scale",
                "When features are measured in unrelated units with very different scales",
                "When the dataset has fewer than 100 examples",
                "Never — PCA standardizes internally",
              ],
              answer: 1,
              explanation:
                "PCA maximizes variance, and variance is unit-dependent: a feature in tiny units gets huge variance and hijacks PC1. Standardizing puts unrelated units on equal footing. With features on one shared, meaningful scale, raw variances can legitimately carry signal.",
            },
            {
              id: "pca-5",
              prompt: "Which limitation of PCA motivates methods like t-SNE, UMAP, or autoencoders?",
              options: [
                "PCA cannot handle more than three components",
                "PCA requires labeled data",
                "PCA only captures linear structure, missing data that lies on curved surfaces",
                "PCA's output changes on every run",
              ],
              answer: 2,
              explanation:
                "PCA projects onto flat linear subspaces. Data on a curved manifold — a spiral, a rolled sheet — cannot be flattened well by any linear projection, which is what nonlinear reduction methods address.",
            },
          ],
          practice: [
            { slug: "standardize-dataset", title: "Standardize Dataset Columns", difficulty: "Easy" },
            { slug: "covariance-correlation-matrix", title: "Covariance and Correlation Matrices", difficulty: "Medium" },
            { slug: "pca-power-iteration", title: "First Principal Component via Power Iteration", difficulty: "Hard" },
          ],
        },
        {
          slug: "similarity-and-distance",
          title: "Similarity and Distance",
          minutes: 14,
          objectives: [
            "Choose between Euclidean distance and cosine similarity based on whether magnitude matters",
            "Measure similarity for text and for user-behavior data",
            "Describe the curse of dimensionality and its effect on distance-based methods",
          ],
          blocks: [
            {
              kind: "p",
              text: "Nearly everything in unsupervised learning reduces to one question: **how similar are these two things?** Clustering groups similar points, anomaly detection flags dissimilar ones, recommenders find similar users or items. The metric you choose *is* the definition of similarity your algorithm learns — so it deserves a deliberate decision, not a default.",
            },
            {
              kind: "heading",
              text: "Euclidean distance vs. cosine similarity",
            },
            {
              kind: "p",
              text: "**Euclidean distance** is straight-line distance between points; it cares about both direction and magnitude. **Cosine similarity** is the cosine of the angle between two vectors; it ignores magnitude entirely. Two vectors pointing the same way have cosine similarity 1 whether one is twice as long as the other — but a large Euclidean distance if their lengths differ.",
            },
            {
              kind: "formula",
              formula: "cos(a, b) = (a · b) / (‖a‖ ‖b‖)",
              explanation:
                "Dot product divided by the product of vector lengths. Ranges from −1 (opposite directions) through 0 (orthogonal — no overlap) to 1 (same direction). Dividing by the lengths is what removes magnitude from the comparison.",
            },
            {
              kind: "code",
              caption: "Both measures in a dozen lines.",
              code: "def euclidean(a, b):\n    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5\n\ndef cosine_similarity(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    na = sum(x * x for x in a) ** 0.5\n    nb = sum(y * y for y in b) ** 0.5\n    return dot / (na * nb)\n\n# doc1 = [2, 0, 4]  # word counts\n# doc2 = [4, 0, 8]  # same words, doc twice as long\n# euclidean(doc1, doc2) = 4.47  (looks different)\n# cosine_similarity(doc1, doc2) = 1.0  (identical topic)",
            },
            {
              kind: "p",
              text: "The decision rule: use cosine when magnitude is a nuisance, Euclidean when magnitude is information. A document twice as long has roughly doubled word counts without changing its topic — cosine correctly calls the two documents identical. A patient with doubled blood pressure is *not* the same patient — Euclidean correctly separates them.",
            },
            {
              kind: "table",
              headers: ["Data", "Magnitude means…", "Preferred measure"],
              rows: [
                ["Text as word counts / TF-IDF", "Document length (nuisance)", "Cosine"],
                ["User ratings or click vectors", "Activity level (usually nuisance)", "Cosine (often mean-centered)"],
                ["Physical measurements", "Actual size of quantities (signal)", "Euclidean, after standardizing"],
                ["Sets (tags, purchased items)", "—", "Jaccard: |A ∩ B| / |A ∪ B|"],
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Why cosine fits users too",
              text: "Represent each user as a vector of interactions over items. A heavy user with 500 clicks and a light user with 20 can still have nearly parallel vectors — same tastes, different activity levels. Cosine compares taste direction while ignoring volume, which is exactly the comparison a recommender needs.",
            },
            {
              kind: "heading",
              text: "The curse of dimensionality",
            },
            {
              kind: "p",
              text: "Distances behave badly as dimensions grow. With many independent features, every pairwise distance becomes a sum of many independent per-feature terms, and those sums concentrate: the gap between the nearest and farthest neighbor shrinks relative to the distances themselves. 'Nearest' becomes barely nearer than 'farthest', and distance-based methods — k-means, DBSCAN, k-NN — lose their discriminating power. Density suffers too: covering high-dimensional space requires exponentially many points, so every region looks sparse and DBSCAN-style density thresholds find nothing.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Distances degrade quietly",
              text: "High-dimensional distance code runs without errors and returns confident-looking numbers — they just stop meaning much. If you have hundreds of raw features, reduce dimensionality first (PCA, embeddings) or use a metric aligned with the data's structure. Real data often helps by lying near a low-dimensional manifold, but verify rather than assume.",
            },
          ],
          quiz: [
            {
              id: "sd-1",
              prompt: "What is the key property that distinguishes cosine similarity from Euclidean distance?",
              options: [
                "Cosine similarity only works on binary vectors",
                "Cosine similarity ignores vector magnitude and compares only direction",
                "Cosine similarity is always larger than Euclidean distance",
                "Cosine similarity requires standardized features",
              ],
              answer: 1,
              explanation:
                "Dividing the dot product by both vector lengths removes scale: only the angle between the vectors remains. Euclidean distance keeps magnitude, so vectors pointing the same way but differing in length are far apart.",
            },
            {
              id: "sd-2",
              prompt: "Document A has word-count vector [3, 1, 0]; document B is the same text repeated twice, [6, 2, 0]. What is their cosine similarity?",
              options: ["0.0", "0.5", "1.0", "It cannot be determined without normalizing"],
              answer: 2,
              explanation:
                "B is exactly 2A, so the vectors point in the same direction — the angle between them is zero and its cosine is 1. This is why cosine is the standard for text: doubling length should not change topical similarity.",
            },
            {
              id: "sd-3",
              prompt: "For clustering patients by physical measurements (blood pressure, glucose, BMI), the better choice is usually:",
              options: [
                "Cosine similarity, because it handles different units",
                "Euclidean distance on standardized features, because magnitudes carry clinical meaning",
                "Jaccard similarity on the raw values",
                "Either — the choice never affects results",
              ],
              answer: 1,
              explanation:
                "Here magnitude is the signal: doubled blood pressure is a clinically different patient, and cosine would discard that. Standardize first so no single unit dominates, then let Euclidean distance compare actual levels.",
            },
            {
              id: "sd-4",
              prompt: "The curse of dimensionality hurts distance-based methods because in high dimensions:",
              options: [
                "Distances become too expensive to compute",
                "All features become correlated with each other",
                "Distances concentrate — the nearest neighbor is barely closer than the farthest",
                "Euclidean distance becomes negative",
              ],
              answer: 2,
              explanation:
                "With many independent features, distances are sums of many terms and their relative spread shrinks. When all points are nearly equidistant, 'nearest' carries almost no information — undermining k-NN, k-means, and density estimates alike.",
            },
            {
              id: "sd-5",
              prompt: "A heavy user (500 interactions) and a light user (20 interactions) have very similar tastes. Which measure best reveals that similarity from their interaction-count vectors?",
              options: [
                "Euclidean distance on the raw counts",
                "Cosine similarity, which compares direction while ignoring activity volume",
                "The absolute difference in their total interaction counts",
                "Manhattan distance on the raw counts",
              ],
              answer: 1,
              explanation:
                "Raw-count distances are dominated by the activity gap: the vectors differ hugely in length. Cosine compares the direction of the vectors — the pattern of which items each user favors — which is where taste lives.",
            },
          ],
          practice: [
            { slug: "cosine-similarity", title: "Cosine Similarity", difficulty: "Easy" },
            { slug: "pairwise-distance-matrix", title: "Pairwise Euclidean Distance Matrix", difficulty: "Easy" },
            { slug: "jaccard-set-similarity", title: "Jaccard Similarity of Sets", difficulty: "Easy" },
            { slug: "minkowski-distance", title: "Minkowski Distance", difficulty: "Easy" },
          ],
        },
        {
          slug: "anomalies-and-recommendations",
          title: "Anomaly Detection and Recommendation Basics",
          minutes: 15,
          objectives: [
            "Detect anomalies with z-scores and with distance-based rules",
            "Explain the collaborative filtering idea behind recommenders",
            "Describe item-item similarity and why it often beats user-user in practice",
          ],
          blocks: [
            {
              kind: "p",
              text: "Two of the most valuable applications of unsupervised learning are mirror images. **Anomaly detection** hunts for the points *least* similar to everything else — fraud, failing machines, intrusions. **Recommendation** hunts for the items *most* similar to what a user already likes. Both are built directly on the similarity tools from the last lesson.",
            },
            {
              kind: "heading",
              text: "Anomalies by z-score",
            },
            {
              kind: "p",
              text: "For a single numeric feature, the classic detector is the **z-score**: how many standard deviations a value sits from the mean. |z| > 3 is the conventional flag — under roughly bell-shaped data, such values are rare enough to warrant a look. It is one line of math, interpretable, and a strong baseline.",
            },
            {
              kind: "code",
              caption: "Z-score anomaly flagging for one feature.",
              code: "def zscore_anomalies(values, threshold=3.0):\n    n = len(values)\n    mean = sum(values) / n\n    var = sum((v - mean) ** 2 for v in values) / n\n    std = var ** 0.5\n    return [\n        i for i, v in enumerate(values)\n        if std > 0 and abs(v - mean) / std > threshold\n    ]\n\n# zscore_anomalies([10, 12, 11, 9, 10, 11, 94]) -> [6]",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Outliers poison their own detector",
              text: "The mean and standard deviation are computed from data that includes the anomalies — and extreme values inflate both, which can hide the very points you are hunting (masking). Robust variants substitute the median and IQR or MAD, which extremes barely move.",
            },
            {
              kind: "p",
              text: "Z-scores are per-feature; multivariate anomalies need a distance view. A **distance-based** detector scores each point by its distance to its k-th nearest neighbor and flags the highest scores — isolated points sit far even from their nearest neighbors. This catches combinations that are individually normal: a transaction amount that is fine, at an hour that is fine, but far from any observed (amount, hour) pair. Clustering gives a third route: after DBSCAN, the noise label is an anomaly flag by construction.",
            },
            {
              kind: "heading",
              text: "Collaborative filtering",
            },
            {
              kind: "p",
              text: "Recommenders answer: what will this user like? **Collaborative filtering** answers using behavior alone — no item descriptions, no user profiles. The premise: users who agreed in the past will agree in the future. If people who liked what you liked also loved a book you have not read, recommend it. The signal is the pattern of overlap in the user-item interaction matrix, and it comes free with usage data.",
            },
            {
              kind: "p",
              text: "**Item-item collaborative filtering** turns this into a concrete algorithm. Represent each *item* as the vector of interactions it received across all users. Two items are similar when largely the same users engaged with both — measured with cosine similarity between their vectors. To recommend: take the items the user liked, collect the most similar items to those, and rank by similarity weighted by the user's ratings.",
            },
            {
              kind: "table",
              headers: ["Approach", "Compares", "Why item-item usually wins"],
              rows: [
                ["User-user", "Users, by their item vectors", "User tastes drift; most user pairs share almost no items"],
                ["Item-item", "Items, by their user vectors", "Item similarities are stable and denser — popular items have many raters — so they can be precomputed and served fast"],
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Similarity from behavior alone",
              text: "Item-item CF never reads a synopsis or a genre tag, yet it learns that two novels are similar — because the same people read both. Behavioral similarity often captures affinities no metadata scheme anticipated. Its blind spot is the flip side: a brand-new item has no interactions, hence no similarity to anything — the cold-start problem, usually patched with content features.",
            },
            {
              kind: "p",
              text: "From here the field deepens rather than changes: matrix factorization learns compact latent vectors for users and items (a PCA-flavored idea applied to the interaction matrix), and ranking metrics like precision@k evaluate whether the top of the recommendation list — the only part users see — is any good. Both build on exactly the similarity machinery you now have.",
            },
          ],
          quiz: [
            {
              id: "ar-1",
              prompt: "A sensor reading has a z-score of 4.2. What does this mean?",
              options: [
                "The reading is 4.2 units above average",
                "The reading is 4.2 standard deviations from the mean — far outside typical variation",
                "The reading occurred 4.2 times",
                "The sensor has a 4.2% chance of being broken",
              ],
              answer: 1,
              explanation:
                "The z-score expresses deviation from the mean in units of standard deviation. Under roughly bell-shaped data, |z| > 3 is already rare, so 4.2 marks the reading as a strong anomaly candidate.",
            },
            {
              id: "ar-2",
              prompt: "Why can extreme outliers hide from a z-score detector computed on the full dataset?",
              options: [
                "Z-scores are undefined for extreme values",
                "The outliers inflate the mean and standard deviation used to score them, shrinking their own z-scores",
                "Extreme values are removed automatically before scoring",
                "Z-scores only detect values below the mean",
              ],
              answer: 1,
              explanation:
                "The detector's mean and standard deviation are estimated from data that includes the anomalies. Extremes drag both upward, which deflates every z-score — masking. Median/IQR-based variants resist this because extremes barely move them.",
            },
            {
              id: "ar-3",
              prompt: "What advantage does a distance-based (k-nearest-neighbor) anomaly detector have over per-feature z-scores?",
              options: [
                "It runs faster on large datasets",
                "It needs no threshold of any kind",
                "It can flag points whose individual feature values are normal but whose combination is unlike anything observed",
                "It works without computing any distances",
              ],
              answer: 2,
              explanation:
                "Per-feature z-scores examine each dimension alone. A fraudulent transaction can be normal in amount and normal in time yet sit far from every observed (amount, time) pair — visible only to a method that measures multivariate distance.",
            },
            {
              id: "ar-4",
              prompt: "What is the core assumption of collaborative filtering?",
              options: [
                "Items with similar descriptions should be recommended together",
                "Users who agreed in their past preferences will tend to agree in the future",
                "Popular items should be recommended to everyone",
                "User demographics determine preferences",
              ],
              answer: 1,
              explanation:
                "Collaborative filtering uses only the pattern of past interactions: overlap in what users engaged with predicts future agreement. No item metadata or user profiles are required — which is both its power and the source of its cold-start weakness.",
            },
            {
              id: "ar-5",
              prompt: "In item-item collaborative filtering, two items are considered similar when:",
              options: [
                "They belong to the same category in the catalog",
                "Their descriptions share many words",
                "Largely the same users interacted with both, making their user-interaction vectors point in similar directions",
                "They were added to the catalog at the same time",
              ],
              answer: 2,
              explanation:
                "Each item is represented by its vector of user interactions, and similarity is computed between those vectors (typically cosine). Co-engagement by the same users — not metadata — is what defines similarity here.",
            },
          ],
          practice: [
            { slug: "zscore-anomaly-ranking", title: "Z-Score Anomaly Ranking", difficulty: "Medium" },
            { slug: "gaussian-anomaly-detector", title: "Gaussian Anomaly Detector", difficulty: "Medium" },
            { slug: "iqr-outlier-detection", title: "IQR Outlier Detection", difficulty: "Easy" },
            { slug: "item-item-cf", title: "Item-Item Collaborative Filtering", difficulty: "Hard" },
          ],
        },
      ],
    },
  ],
};
