import type { Course } from "../types";

export const nlp: Course = {
  slug: "nlp",
  title: "Natural Language Processing",
  tagline: "Teaching machines to read",
  level: "Advanced",
  accent: "from-cyan-500 to-sky-600",
  description:
    "Language is ambiguous, compositional, and endlessly creative — everything models find hard. Build up from tokens and TF-IDF through embeddings and language models to the transformer-era paradigm that powers modern NLP.",
  modules: [
    {
      slug: "text-to-numbers",
      title: "From Text to Numbers",
      description: "Tokenization, sparse vectors, and classical ranking.",
      lessons: [
        {
          slug: "tokenization-and-preprocessing",
          title: "Tokenization and Text Preprocessing",
          minutes: 13,
          objectives: [
            "Break text into tokens and normalize them deliberately",
            "Weigh stopword removal and stemming against what they destroy",
            "Use n-grams to recover local word order",
          ],
          blocks: [
            {
              kind: "p",
              text: "Every NLP system begins by deciding what its atoms are. **Tokenization** splits raw text into units — words, punctuation, or subword pieces. It looks trivial (\"split on spaces\") and is not: `don't` may be one token or two, `New Delhi` names one thing in two words, and many scripts do not use spaces at all.",
            },
            {
              kind: "heading",
              text: "Normalization: collapsing variants",
            },
            {
              kind: "list",
              items: [
                "**Lowercasing** merges `Apple`/`apple` — usually right, though it erases the company/fruit distinction.",
                "**Stopword removal** drops high-frequency glue words (`the`, `is`, `of`) that carry little topical signal — but `to be or not to be` is entirely stopwords.",
                "**Stemming** chops suffixes by rule (`running` → `run`, but also `universal` → `univers`): fast and crude. **Lemmatization** maps to dictionary forms using vocabulary and part of speech (`better` → `good`): slower and cleaner.",
              ],
            },
            {
              kind: "code",
              caption: "A minimal normalization pipeline.",
              code: "import re\n\nSTOPWORDS = {\"the\", \"is\", \"a\", \"of\", \"and\", \"to\", \"in\"}\n\ndef preprocess(text):\n    tokens = re.findall(r\"[a-z0-9']+\", text.lower())\n    return [t for t in tokens if t not in STOPWORDS]\n\n# preprocess(\"The cat sat on the mat\") -> ['cat', 'sat', 'on', 'mat']",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Every normalization destroys information",
              text: "Lowercasing, stopword removal, and stemming all merge distinctions the task might need. Sentiment analysis needs `not`; search over Shakespeare needs stopwords. Choose per task and measure — never preprocess on autopilot.",
            },
            {
              kind: "heading",
              text: "N-grams and subwords",
            },
            {
              kind: "p",
              text: "Single-token features lose all order: `dog bites man` and `man bites dog` become identical bags. **N-grams** — sequences of n consecutive tokens — restore local order (`dog bites`, `bites man`), at the price of an exploding, sparser vocabulary. **Character n-grams** are robust to typos and morphology, and modern **subword tokenization** (the approach behind today's language models) splits rare words into learned frequent pieces — `unhappiness` → `un + happi + ness` — bounding vocabulary size while representing any string with no unknown tokens.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "The vocabulary is a contract",
              text: "Whatever tokenization and normalization you fit on training text becomes part of the model. Prediction-time text must pass through byte-identical preprocessing — mismatched tokenizers are one of the most common silent NLP bugs.",
            },
          ],
          quiz: [
            {
              id: "tk-1",
              prompt: "Why is whitespace splitting insufficient as a general tokenizer?",
              options: [
                "It is too slow for large corpora",
                "Contractions, multi-word names, and space-free scripts all break the one-word-per-space assumption",
                "It produces too few tokens",
                "It only works on lowercase text",
              ],
              answer: 1,
              explanation:
                "Tokenization is full of edge cases — `don't`, `New Delhi`, and languages written without spaces. Real tokenizers encode many decisions beyond splitting on whitespace.",
            },
            {
              id: "tk-2",
              prompt: "For which task is removing stopwords most likely HARMFUL?",
              options: [
                "Topic classification of news articles",
                "Sentiment analysis, where words like 'not' invert meaning",
                "Counting document lengths",
                "Deduplicating a corpus",
              ],
              answer: 1,
              explanation:
                "Negations are stopwords by frequency but pivotal for sentiment: 'not good' and 'good' must not collapse together. Stopword lists are task decisions, not defaults.",
            },
            {
              id: "tk-3",
              prompt: "Stemming differs from lemmatization in that stemming:",
              options: [
                "Uses a dictionary and part-of-speech analysis",
                "Applies crude suffix-chopping rules that may produce non-words",
                "Only works on English",
                "Preserves the original text exactly",
              ],
              answer: 1,
              explanation:
                "Stemming is fast rule-based truncation ('univers' from 'universal'); lemmatization consults vocabulary to return real dictionary forms ('good' from 'better').",
            },
            {
              id: "tk-4",
              prompt: "What do bigram features add over single-word features?",
              options: [
                "Smaller vocabulary size",
                "Local word order — 'dog bites' and 'bites dog' become distinct features",
                "Protection from typos",
                "Faster training",
              ],
              answer: 1,
              explanation:
                "Bags of single words erase order entirely. N-grams keep short sequences intact, capturing phrases and local syntax at the cost of a larger, sparser feature space.",
            },
            {
              id: "tk-5",
              prompt: "Subword tokenization solves the unknown-word problem by:",
              options: [
                "Deleting rare words from the corpus",
                "Splitting rare words into learned frequent pieces so any string is representable",
                "Storing an infinite vocabulary",
                "Replacing rare words with synonyms",
              ],
              answer: 1,
              explanation:
                "With a fixed inventory of frequent pieces (plus characters as a floor), every possible string decomposes into known units — bounded vocabulary, no out-of-vocabulary tokens.",
            },
          ],
          practice: [
            { slug: "stopword-filtering", title: "Stopword Filtering", difficulty: "Easy" },
            { slug: "char-ngram-profile", title: "Character N-Gram Profile", difficulty: "Easy" },
            { slug: "edit-distance", title: "Levenshtein Edit Distance", difficulty: "Medium" },
          ],
        },
        {
          slug: "tfidf-and-bm25",
          title: "TF-IDF and BM25",
          minutes: 14,
          objectives: [
            "Build bag-of-words vectors and explain their sparsity",
            "Weight terms by TF-IDF and justify the IDF factor",
            "Explain BM25's saturation and length normalization for ranking",
          ],
          blocks: [
            {
              kind: "p",
              text: "The **bag-of-words** model turns a document into a vector of token counts over a fixed vocabulary — order discarded, counts kept. The vectors are huge (vocabulary-sized) and almost entirely zeros, but linear models handle that sparsity beautifully, which kept bag-of-words competitive for decades.",
            },
            {
              kind: "p",
              text: "Raw counts have a flaw: the most frequent words are the least informative. Every document about anything contains `the`. **TF-IDF** fixes this by weighting each term's frequency in the document (TF) by how rare it is across the corpus (IDF) — words appearing in few documents get amplified; words appearing everywhere get crushed toward zero.",
            },
            {
              kind: "formula",
              formula: "tfidf(t, d) = tf(t, d) · log(N / df(t))",
              explanation:
                "N documents total, df(t) of them containing term t. A term in every document scores log(1) = 0 — maximally common, zero distinguishing power.",
            },
            {
              kind: "code",
              caption: "IDF from a document collection.",
              code: "import math\n\ndef idf(term, documents):\n    df = sum(1 for doc in documents if term in doc)\n    return math.log(len(documents) / df) if df else 0.0\n\n# 'the' in 1000/1000 docs -> log(1) = 0\n# 'transformer' in 3/1000  -> log(333.3) = 5.8",
            },
            {
              kind: "p",
              text: "Two TF-IDF vectors compared by **cosine similarity** give classical search: score every document against the query, rank by similarity. This exact pipeline powered search engines for years and remains a strong, interpretable baseline.",
            },
            {
              kind: "heading",
              text: "BM25: TF-IDF with two fixes",
            },
            {
              kind: "list",
              items: [
                "**Term-frequency saturation:** in TF-IDF, 50 occurrences score ~50x one occurrence. BM25 caps the curve — a term's 10th repetition adds far less than its 1st, controlled by parameter k1. Relevance saturates; spam-by-repetition stops paying.",
                "**Length normalization:** long documents mention everything more, unfairly outranking concise ones. BM25 discounts scores by document length relative to the corpus average, controlled by parameter b.",
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "BM25 is still the retrieval workhorse",
              text: "Decades after its design, BM25 remains the default first-stage ranker in search systems — including many that rerank its candidates with neural models. Understanding its two corrections to TF-IDF explains most of its endurance.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "What sparse vectors cannot see",
              text: "TF-IDF and BM25 match exact tokens. A query for 'car' scores a document about 'automobiles' at zero — no shared terms, no similarity. Fixing this vocabulary mismatch is precisely what embeddings, next lesson, are for.",
            },
          ],
          quiz: [
            {
              id: "tf-1",
              prompt: "Why does the IDF factor down-weight very common words?",
              options: [
                "Common words are usually misspelled",
                "A term present in nearly every document cannot distinguish any document from the rest",
                "Common words inflate file sizes",
                "IDF removes the need for tokenization",
              ],
              answer: 1,
              explanation:
                "Distinguishing power comes from rarity: log(N/df) approaches zero as a term approaches ubiquity, zeroing out words that appear everywhere.",
            },
            {
              id: "tf-2",
              prompt: "A term appears in ALL N documents of a corpus. Its IDF is:",
              options: ["1", "0, since log(N/N) = log(1) = 0", "N", "Undefined"],
              answer: 1,
              explanation:
                "df = N gives log(N/N) = 0. The term contributes nothing to any document's TF-IDF vector — exactly the intended treatment of ubiquitous words.",
            },
            {
              id: "tf-3",
              prompt: "BM25's term-frequency saturation means:",
              options: [
                "Long queries are truncated",
                "Repeating a term many times yields diminishing additional relevance",
                "Only the first occurrence of each term counts",
                "Scores are capped at 1.0",
              ],
              answer: 1,
              explanation:
                "BM25's TF curve flattens with repetition (rate set by k1): occurrence 10 adds far less than occurrence 1. Keyword-stuffing stops improving rank.",
            },
            {
              id: "tf-4",
              prompt: "BM25 normalizes by document length because:",
              options: [
                "Long documents are harder to store",
                "Longer documents mention more terms by sheer bulk, unfairly outscoring concise relevant ones",
                "Short documents are always better answers",
                "Length equals quality",
              ],
              answer: 1,
              explanation:
                "Without correction, raw term counts favor verbosity. BM25 discounts by length relative to the corpus average (strength set by b), leveling the comparison.",
            },
            {
              id: "tf-5",
              prompt: "A TF-IDF search for 'car' misses a relevant document that only says 'automobile'. This illustrates:",
              options: [
                "An IDF computation bug",
                "The vocabulary-mismatch limit of exact-token sparse representations",
                "Insufficient stopword removal",
                "A tokenizer crash",
              ],
              answer: 1,
              explanation:
                "Sparse vectors only overlap on shared tokens; synonyms share none. Dense embeddings address exactly this by placing similar meanings near each other.",
            },
          ],
          practice: [
            { slug: "bag-of-words", title: "Bag-of-Words Count Vectors", difficulty: "Easy" },
            { slug: "tfidf-document-ranking", title: "TF-IDF Document Ranking", difficulty: "Hard" },
            { slug: "bm25-ranking", title: "BM25 Document Ranking", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      slug: "meaning-and-models",
      title: "Meaning and Models",
      description: "Dense meaning, probabilistic text, and the transformer era.",
      lessons: [
        {
          slug: "word-embeddings",
          title: "Word Embeddings",
          minutes: 13,
          objectives: [
            "State the distributional hypothesis and how it enables learned meaning",
            "Compare words with cosine similarity in embedding space",
            "Recognize the limits of static, one-vector-per-word embeddings",
          ],
          blocks: [
            {
              kind: "p",
              text: "Sparse vectors treat `car` and `automobile` as unrelated dimensions. **Embeddings** fix this by representing each word as a dense vector of a few hundred learned numbers, positioned so that similar meanings sit close together. The geometry IS the semantics.",
            },
            {
              kind: "callout",
              tone: "definition",
              title: "The distributional hypothesis",
              text: "Words appearing in similar contexts have similar meanings — 'you shall know a word by the company it keeps.' This turns meaning into a statistical, learnable property: predict a word's context well, and you have learned something about its meaning.",
            },
            {
              kind: "p",
              text: "Embedding methods train exactly that way: slide over billions of words, and learn vectors such that words predict their neighbors. No human defines any dimension; similarity structure emerges from co-occurrence alone. `car` and `automobile` end up close because they keep identical company.",
            },
            {
              kind: "code",
              caption: "Cosine similarity — the standard meaning comparison.",
              code: "def cosine(u, v):\n    dot = sum(a * b for a, b in zip(u, v))\n    nu = sum(a * a for a in u) ** 0.5\n    nv = sum(b * b for b in v) ** 0.5\n    return dot / (nu * nv) if nu and nv else 0.0\n\n# cosine(car, automobile) -> ~0.85   cosine(car, banana) -> ~0.15",
            },
            {
              kind: "p",
              text: "Famously, directions in the space carry meaning too: the vector from `man` to `woman` roughly parallels `king` to `queen`, so king − man + woman lands near queen. Analogies, plurals, and even cross-language correspondences show up as consistent offsets — evidence the space encodes relations, not just neighborhoods.",
            },
            {
              kind: "heading",
              text: "What static embeddings get wrong",
            },
            {
              kind: "list",
              items: [
                "**One vector per word:** `bank` (river) and `bank` (finance) share a single point — polysemy is averaged away.",
                "**Frozen after training:** meanings drift and new words appear; the table does not.",
                "**Bias absorption:** embeddings inherit the associations of their training text, including stereotypes — a real deployment concern to measure, not assume away.",
              ],
            },
            {
              kind: "callout",
              tone: "insight",
              title: "The fix became the revolution",
              text: "Contextual models compute a DIFFERENT vector for each occurrence of a word, informed by its sentence — 'bank' near 'river' embeds differently than near 'loan'. That idea, powered by attention, is the bridge from static embeddings to modern language models.",
            },
          ],
          quiz: [
            {
              id: "we-1",
              prompt: "The distributional hypothesis states that:",
              options: [
                "Word frequency follows a power law",
                "Words occurring in similar contexts tend to have similar meanings",
                "Long words are rarer than short words",
                "Every language has the same grammar",
              ],
              answer: 1,
              explanation:
                "Context is a measurable proxy for meaning — which converts semantics into a statistical property learnable from raw text, no dictionaries required.",
            },
            {
              id: "we-2",
              prompt: "Compared to one-hot/sparse representations, embeddings:",
              options: [
                "Use more dimensions per word",
                "Place semantically similar words near each other, so similarity is computable",
                "Require labeled training data",
                "Store exact word counts",
              ],
              answer: 1,
              explanation:
                "Sparse dimensions are unrelated by construction; every pair of distinct words is equally far apart. Dense learned vectors give 'car' and 'automobile' high cosine similarity.",
            },
            {
              id: "we-3",
              prompt: "king − man + woman ≈ queen demonstrates that:",
              options: [
                "Embeddings memorize an analogy dictionary",
                "Consistent directions in the space encode relations like gender",
                "Vector arithmetic is exact",
                "Royalty words get special treatment",
              ],
              answer: 1,
              explanation:
                "The offset between related pairs is roughly parallel across the space — relations surface as directions, purely from co-occurrence statistics.",
            },
            {
              id: "we-4",
              prompt: "A static embedding's core weakness with the word 'bank' is:",
              options: [
                "The word is too short to embed",
                "One vector must average the river sense and the finance sense together",
                "It cannot be lowercased",
                "Cosine similarity is undefined for it",
              ],
              answer: 1,
              explanation:
                "One vector per word type means all senses collapse into a single point. Contextual models solve this by embedding each occurrence in light of its sentence.",
            },
            {
              id: "we-5",
              prompt: "Embeddings trained on web text may encode social stereotypes because:",
              options: [
                "The training algorithm is biased by design",
                "They faithfully learn the co-occurrence patterns of their training data, biases included",
                "Cosine similarity amplifies rare words",
                "Vectors are randomly initialized",
              ],
              answer: 1,
              explanation:
                "Embeddings mirror the statistics of their corpus. Associations present in the text — desirable or not — become geometry, which deployed systems must measure and mitigate.",
            },
          ],
          practice: [
            { slug: "cosine-similarity", title: "Cosine Similarity", difficulty: "Easy" },
            { slug: "language-cosine-retrieval", title: "Language Cosine Top-K Retrieval", difficulty: "Medium" },
            { slug: "jaccard-set-similarity", title: "Jaccard Similarity of Sets", difficulty: "Easy" },
          ],
        },
        {
          slug: "language-models",
          title: "Language Models",
          minutes: 14,
          objectives: [
            "Define language modeling as next-token probability estimation",
            "Build n-gram models and explain why smoothing is mandatory",
            "Interpret perplexity as an evaluation metric",
          ],
          blocks: [
            {
              kind: "p",
              text: "A **language model** assigns probabilities to text: given a context, what token comes next? `The cat sat on the ___` should make `mat` likelier than `galaxy`. Model that one distribution well and you can score fluency, correct spelling, transcribe speech — and, by sampling repeatedly, generate text.",
            },
            {
              kind: "heading",
              text: "N-gram models: counting with a short memory",
            },
            {
              kind: "p",
              text: "The classical approach truncates history: a **bigram** model conditions on one previous word, a **trigram** on two. Probabilities are just normalized counts from a corpus — P(mat | the) = count(the mat) / count(the). Simple, fast, interpretable, and the same Markov machinery drives autocomplete and classic speech systems.",
            },
            {
              kind: "code",
              caption: "A bigram model with add-one smoothing.",
              code: "def bigram_probability(prev, word, counts, vocab_size, alpha=1.0):\n    pair = counts.get((prev, word), 0)\n    context = sum(c for (p, _), c in counts.items() if p == prev)\n    return (pair + alpha) / (context + alpha * vocab_size)\n\n# alpha > 0 keeps unseen pairs from scoring exactly zero.",
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Why smoothing is not optional",
              text: "Any n-gram absent from training data gets probability zero — and one zero factor zeroes an entire sentence's probability. Language is productive; unseen combinations are guaranteed. Smoothing (add-alpha, backoff to shorter contexts, interpolation) reserves probability mass for the unseen.",
            },
            {
              kind: "heading",
              text: "Perplexity: the standard scorecard",
            },
            {
              kind: "formula",
              formula: "perplexity = exp( − mean log P(tokenᵢ | context) )",
              explanation:
                "The exponentiated average surprise per token on held-out text. Lower is better; a perplexity of k means the model is, on average, as uncertain as a fair k-way choice.",
            },
            {
              kind: "p",
              text: "N-grams hit a wall: memory beyond two or three words explodes combinatorially, and counts cannot generalize — seeing `red car` teaches nothing about `crimson car`. **Neural language models** solve both at once: embeddings let similar words share evidence, and networks (recurrent, then transformer) condition on long contexts without enumerating them.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "One objective, remarkable reach",
              text: "Next-token prediction looks humble, but predicting well forces a model to absorb syntax, facts, and discourse structure — whatever reduces surprise. This single self-supervised objective, scaled up, is the foundation of modern language AI.",
            },
          ],
          quiz: [
            {
              id: "lm-1",
              prompt: "A language model fundamentally estimates:",
              options: [
                "The grammatical parse tree of a sentence",
                "The probability distribution over the next token given context",
                "The sentiment of a document",
                "The language a text is written in",
              ],
              answer: 1,
              explanation:
                "Everything else — scoring fluency, generation by sampling, reranking transcriptions — derives from modeling P(next token | context) well.",
            },
            {
              id: "lm-2",
              prompt: "A trigram model conditions each word on:",
              options: [
                "The entire preceding document",
                "The previous two words",
                "The following word",
                "Three random words",
              ],
              answer: 1,
              explanation:
                "N-gram models truncate history to n−1 previous tokens: bigram sees one, trigram two. The truncation is what makes counting feasible — and what limits the model.",
            },
            {
              id: "lm-3",
              prompt: "Without smoothing, one unseen bigram in a long sentence makes the sentence's probability:",
              options: ["Slightly lower", "Exactly zero, since probabilities multiply", "Unchanged", "Higher"],
              answer: 1,
              explanation:
                "Sentence probability is a product of per-token probabilities; a single zero factor annihilates it. Smoothing exists because unseen-but-valid combinations are guaranteed in productive language.",
            },
            {
              id: "lm-4",
              prompt: "A perplexity of 20 on held-out text means the model is on average:",
              options: [
                "Correct 20% of the time",
                "As uncertain as choosing uniformly among 20 options per token",
                "20 tokens behind the context",
                "Twenty times larger than a bigram model",
              ],
              answer: 1,
              explanation:
                "Perplexity exponentiates average per-token surprise into an effective branching factor. Lower means the model finds real text less surprising — the goal.",
            },
            {
              id: "lm-5",
              prompt: "Neural language models generalize where n-grams cannot chiefly because:",
              options: [
                "They store more n-gram counts",
                "Embeddings let similar words share evidence, so 'crimson car' benefits from 'red car'",
                "They ignore word order",
                "They train without any text",
              ],
              answer: 1,
              explanation:
                "Counts treat every word as an unrelated symbol. Dense representations transfer what is learned about a word to its neighbors in embedding space — generalization n-grams structurally lack.",
            },
          ],
          practice: [
            { slug: "markov-next-token", title: "Markov Chain Next-Token Prediction", difficulty: "Medium" },
            { slug: "categorical-naive-bayes", title: "Categorical Naive Bayes with Laplace Smoothing", difficulty: "Medium" },
            { slug: "viterbi-decoding", title: "Viterbi Decoding for Hidden Markov Models", difficulty: "Hard" },
          ],
        },
        {
          slug: "transformers-for-nlp",
          title: "Modern NLP: Pretrain, Then Adapt",
          minutes: 14,
          objectives: [
            "Explain the pretrain-finetune paradigm and why it changed NLP",
            "Contrast masked and causal language-model pretraining",
            "Reason about what attention buys for language specifically",
          ],
          blocks: [
            {
              kind: "p",
              text: "Classical NLP trained one model per task from that task's labeled data — expensive labels, shallow models. Modern NLP inverts this: **pretrain** one large transformer on next-token or fill-in-the-blank prediction over vast unlabeled text, then **adapt** it — with finetuning on a small labeled set, or by simply instructing it — to each downstream task. The expensive knowledge is learned once, from free supervision.",
            },
            {
              kind: "heading",
              text: "Two pretraining recipes",
            },
            {
              kind: "table",
              headers: ["", "Masked LM", "Causal LM"],
              rows: [
                ["Objective", "Predict hidden tokens from BOTH sides", "Predict the next token, left to right"],
                ["Context seen", "Bidirectional", "Only the past"],
                ["Natural strength", "Understanding tasks: classification, extraction, retrieval", "Generation: continuation, dialogue, code"],
                ["Generation", "Awkward — not its training objective", "Native — sampling is the objective"],
              ],
            },
            {
              kind: "p",
              text: "Why attention specifically for language? Meaning routinely depends on distant context — a pronoun and its referent forty tokens apart, a verb agreeing with a far-away subject. Attention connects any two positions in one step, and different heads learn different relation types. Contextual embeddings fall out naturally: each occurrence of `bank` is represented in light of its actual sentence.",
            },
            {
              kind: "callout",
              tone: "insight",
              title: "Scale changed what the objective yields",
              text: "Trained small, next-token predictors learn spelling and phrases. Scaled up in data and parameters, the same objective yields models that answer questions and follow instructions — because predicting text written by knowledgeable humans increasingly requires modeling what they know. The objective never changed; its consequences did.",
            },
            {
              kind: "heading",
              text: "Practical adaptation",
            },
            {
              kind: "list",
              items: [
                "**Full finetuning** updates all weights on task data — strongest, costliest per task.",
                "**Parameter-efficient tuning** trains small added modules while freezing the base — one shared backbone, many cheap task heads.",
                "**Prompting / in-context learning** adapts with zero weight updates: instructions and examples in the input steer behavior at inference time.",
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Capability is not reliability",
              text: "Pretrained models inherit their corpus: its knowledge cutoffs, gaps, and biases — and they generate fluent text even when wrong. Deployments need evaluation on YOUR task distribution, grounding in trusted sources where facts matter, and human oversight proportional to stakes. Fluency is not evidence.",
            },
            {
              kind: "p",
              text: "This paradigm — self-supervised pretraining, lightweight adaptation, attention underneath — now spans vision, audio, and code as well. The concepts in this course, from tokens to attention, are exactly the load-bearing pieces of that stack.",
            },
          ],
          quiz: [
            {
              id: "tn-1",
              prompt: "The pretrain-finetune paradigm's central economic advantage is:",
              options: [
                "Finetuning requires no computers",
                "Expensive general knowledge is learned once from unlabeled text, then reused across many tasks with little labeled data",
                "Pretrained models never need evaluation",
                "It eliminates tokenization",
              ],
              answer: 1,
              explanation:
                "Unlabeled text is nearly free and unlimited; task labels are scarce and costly. Learning language once from the former slashes the labeled data each downstream task needs.",
            },
            {
              id: "tn-2",
              prompt: "A masked language model differs from a causal one in that it:",
              options: [
                "Trains without any text",
                "Predicts hidden tokens using context from both directions, rather than only the past",
                "Cannot use attention",
                "Requires labeled data",
              ],
              answer: 1,
              explanation:
                "Masked models fill blanks bidirectionally — ideal for understanding tasks. Causal models see only leftward context, which is exactly what generation requires.",
            },
            {
              id: "tn-3",
              prompt: "For building a text-generation system, the natural pretraining choice is:",
              options: [
                "Masked LM",
                "Causal LM — generation IS its training objective",
                "A clustering model",
                "TF-IDF",
              ],
              answer: 1,
              explanation:
                "Causal models are trained to produce the next token from what came before; sampling from them is generation by construction. Masked models must be contorted to generate.",
            },
            {
              id: "tn-4",
              prompt: "Attention suits language particularly well because:",
              options: [
                "Sentences are always short",
                "Meaning depends on long-range relationships, which attention connects in a single step",
                "Words arrive alphabetically",
                "It removes the need for embeddings",
              ],
              answer: 1,
              explanation:
                "Pronoun references, agreement, and discourse links span arbitrary distances. Direct any-to-any connection — with heads specializing in different relations — matches language's structure.",
            },
            {
              id: "tn-5",
              prompt: "Why is fluent output from a pretrained model NOT sufficient evidence of correctness?",
              options: [
                "Fluent text is always correct",
                "The generation objective rewards plausible continuation, so confident fluent text can be factually wrong",
                "Fluency indicates a small model",
                "Correctness requires longer outputs",
              ],
              answer: 1,
              explanation:
                "The model was trained to continue text plausibly, not to verify truth. Deployment therefore demands task-specific evaluation, grounding for factual claims, and stake-proportional oversight.",
            },
          ],
          practice: [
            { slug: "scaled-dot-attention", title: "Scaled Dot-Product Attention", difficulty: "Medium" },
            { slug: "multinomial-naive-bayes", title: "Multinomial Naive Bayes for Text", difficulty: "Medium" },
            { slug: "mean-reciprocal-rank", title: "Mean Reciprocal Rank", difficulty: "Medium" },
          ],
        },
      ],
    },
  ],
};
