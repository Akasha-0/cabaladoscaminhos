# HARNESS EVAL SYSTEM v2.0
## Self-Evolution Framework for Autonomous Harness

---

## 📊 METRIC DASHBOARD

### Core Metrics (always tracked)

| ID | Metric | Target | Weight | Description |
|----|--------|--------|--------|-------------|
| M1 | **AutoProgression** | > 95% | 20% | Tasks completadas sem input manual |
| M2 | **ZeroAskQuestion** | 0 | 20% | Perguntas ao usuário = 0 |
| M3 | **ContextStable** | < 50% | 15% | Context não cresce acima de 50% |
| M4 | **GitCommitRate** | 100% | 10% | Commits automáticos por task |
| M5 | **GitTagRate** | 100% | 10% | Tags criados ao completar milestone |
| M6 | **TestPassRate** | > 85% | 10% | Testes passando |
| M7 | **CostEfficiency** | < $0.50/task | 10% | Custo por task completada |
| M8 | **TimePerTask** | < 2min | 5% | Tempo médio por task |

### Advanced Metrics (evolution tracking)

| ID | Metric | Target | Description |
|----|--------|--------|-------------|
| M9 | **LearningCurve** | improving | Evolução de performance ao longo do tempo |
| M10 | **PatternRecognition** | > 80% | Acertos em decisões autônomas |
| M11 | **SelfCorrectionRate** | > 90% | Correções automáticas que funcionam |
| M12 | **ContextReuse** | > 70% | Reutilização de contexto entre tasks |
| M13 | **ErrorRecovery** | < 5% fail | Falhas recuperadas automaticamente |
| M14 | **KnowledgeRetention** | improving | Retenção de padrões aprendidos |
| M15 | **DecisionQuality** | > 85% | Qualidade das decisões autônomas |

---

## 🔢 SCORING SYSTEM

### Score Calculation

```
OVERALL_SCORE = Σ(M_i × W_i)

Where:
- M_i = normalized metric value (0-100)
- W_i = weight
- Σ W_i = 100
```

### Grade Thresholds

| Grade | Score | Action |
|-------|-------|--------|
| A+ | 95-100 | Excellent - mantendo |
| A | 85-94 | Good - minor tweaks |
| B | 70-84 | Acceptable - needs improvement |
| C | 50-69 | Warning - requires correction |
| D | < 50 | Critical - STOP and fix |

### Metric Normalization

```python
def normalize(metric, value, target):
    if metric == "ZeroAskQuestion":
        return 100 if value == 0 else 0
    
    elif metric == "ContextStable":
        return 100 if value < 50 else max(0, 100 - (value - 50) * 2)
    
    elif metric == "CostEfficiency":
        # $0.50/task = 100, $1.00/task = 50, >$2 = 0
        return max(0, 100 - (value / 0.50 - 1) * 50)
    
    elif metric == "TestPassRate":
        return value  # Already 0-100
    
    else:
        # Generic: value / target * 100, cap at 100
        return min(100, (value / target) * 100)
```

---

## 📈 EVOLUTION TRACKING

### Iteration Log (per cycle)

```json
{
  "iteration": 42,
  "timestamp": "2026-05-28T12:00:00Z",
  "metrics": {
    "M1": 96,
    "M2": 100,
    "M3": 45,
    "M4": 100,
    "M5": 100,
    "M6": 88,
    "M7": 72,
    "M8": 85
  },
  "overall_score": 87.3,
  "grade": "A",
  "corrections_applied": ["watchdog", "auto-continue"],
  "effectiveness": 0.85,
  "notes": "Improved M3 from 38% to 45%"
}
```

### Learning History

```
Iteration | Score | Grade | M1    | M2    | M3    | Corrections
----------|-------|-------|-------|-------|-------|------------
1         | 45    | D     | 30%   | 100%  | 52%   | none
5         | 58    | C     | 45%   | 100%  | 48%   | watchdog
10        | 72    | B     | 68%   | 100%  | 44%   | auto-continue
15        | 79    | B     | 75%   | 100%  | 42%   | context-reset
20        | 85    | A     | 88%   | 100%  | 38%   | memory-system
25        | 91    | A+    | 94%   | 100%  | 35%   | pattern-learn
```

### Curve Analysis

```python
def analyze_learning_curve(history):
    scores = [h['overall_score'] for h in history]
    
    # Exponential moving average
    ema = calculate_ema(scores, alpha=0.3)
    
    # Trend detection
    if ema[-1] > ema[-5] + 5:
        return "IMPROVING_EXPONENTIALLY"
    elif ema[-1] > ema[-5]:
        return "IMPROVING_GRADUALLY"
    elif ema[-1] < ema[-5] - 5:
        return "DEGRADING"
    else:
        return "STABLE"
```

---

## 🧠 MEMORY SYSTEM

### Context Memory (per task)

```typescript
interface TaskMemory {
  task_id: string;
  timestamp: Date;
  
  // What was attempted
  approach: string;
  code_written: string[];
  files_modified: string[];
  
  // Results
  success: boolean;
  errors: string[];
  time_spent: number;
  
  // Learning
  patterns_learned: string[];
  patterns_failed: string[];
  
  // Context
  context_used: number;  // tokens
  context_effective: boolean;
}
```

### Pattern Library

```typescript
interface Pattern {
  name: string;
  description: string;
  trigger: string;  // when to use
  success_rate: number;
  last_used: Date;
  times_used: number;
  context: {
    task_type: string;
    stack: string;
    complexity: "low" | "medium" | "high";
  };
}

// Example patterns
const PATTERNS = [
  {
    name: "jwt-implementation",
    trigger: "task contains 'auth' or 'jwt'",
    success_rate: 0.92,
    context: { task_type: "auth", stack: "nextjs", complexity: "medium" }
  },
  {
    name: "api-testing",
    trigger: "task contains 'test' and 'api'",
    success_rate: 0.88,
    context: { task_type: "testing", stack: "nextjs", complexity: "low" }
  }
];
```

### Knowledge Base Schema

```markdown
## ~/.pi/agent/memory/

harness/
├── iterations/
│   ├── iteration-001.json
│   ├── iteration-002.json
│   └── ...
├── patterns/
│   ├── jwt-auth.json
│   ├── api-testing.json
│   └── ...
├── corrections/
│   ├── watchdog.json
│   ├── auto-continue.json
│   └── ...
├── decisions/
│   ├── 2026-05-28-001.json  # Auto-decisions made
│   └── ...
└── learnings/
    ├── what-works.json
    └── what-fails.json
```

---

## 🔧 AUTO-CORRECTOR SYSTEM

### Correction Triggers

| Condition | Trigger | AutoFix |
|----------|---------|---------|
| M2 < 100 | AskUserQuestion used | Add "NO_ASK" rule to prompt |
| M3 > 50% | Context growing | Trigger context reset |
| M8 > 5min | Slow tasks | Optimize approach |
| M6 < 85% | Tests failing | Review test strategy |
| M7 > $1 | Expensive tasks | Cache frequent operations |

### Correction Library

```yaml
corrections:
  - name: "add-watchdog"
    trigger: "idle > 2min without progress"
    action: |
      1. Inject watchdog loop into run-harness.sh
      2. Set idle_threshold = 120s
      3. On trigger: send "continue" command
    
  - name: "context-reset"
    trigger: "context > 60% tokens"
    action: |
      1. Save current progress to .ralph/checkpoint.md
      2. Start new pi session with clean context
      3. Load checkpoint and continue
    
  - name: "add-no-ask-rule"
    trigger: "AskUserQuestion count > 0"
    action: |
      1. Add HARD RULE to AGENTS.md: NO AskUserQuestion
      2. Add 6 Auto-Decision Principles
      3. Force re-evaluation
    
  - name: "optimize-approach"
    trigger: "time_per_task > 5min"
    action: |
      1. Analyze slow tasks
      2. Identify bottleneck
      3. Apply optimization pattern
```

### Self-Correction Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                    SELF-CORRECTOR LOOP                         │
│                                                                 │
│  1. MONITOR                                                     │
│     └── Collect metrics every 30s                             │
│                                                                 │
│  2. EVALUATE                                                    │
│     └── Compare against thresholds                            │
│                                                                 │
│  3. DECIDE                                                      │
│     └── If metric < threshold → apply correction               │
│                                                                 │
│  4. EXECUTE                                                     │
│     └── Run correction script                                   │
│                                                                 │
│  5. VERIFY                                                      │
│     └── Check if correction worked                             │
│                                                                 │
│  6. LEARN                                                       │
│     └── Store pattern in knowledge base                       │
│                                                                 │
│  Loop every 60s                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 EVAL COLLECTION SCRIPT

### eval-collector.sh

```bash
#!/bin/bash
# eval-collector.sh - Collect all metrics

PROJECT_DIR="$HOME/cabala-dos-caminhos"
RALPH_DIR="$PROJECT_DIR/.ralph"

echo "=== HARNESS EVAL COLLECTION ==="
echo "Timestamp: $(date -Iseconds)"
echo ""

# M1: Auto-progression (tasks completed / total tasks without input)
total_tasks=$(grep -r "^\- \[ \]" "$RALPH_DIR"/*.md 2>/dev/null | wc -l || echo 0)
completed_tasks=$(grep -r "^\- \[x\]" "$RALPH_DIR"/*.md 2>/dev/null | wc -l || echo 0)
manual_inputs=$(tmux capture-pane -t pi-harness -p 2>/dev/null | grep -cE "(Enter|continue)" || echo 0)

M1=$((completed_tasks * 100 / (total_tasks + 1) - manual_inputs * 5))
echo "M1 (AutoProgression): $M1%"

# M2: Zero AskQuestion
AQ_COUNT=$(tmux capture-pane -t pi-harness -p 2>/dev/null | grep -c "ask_user_question\|AskUserQuestion" || echo 0)
M2=$((100 - AQ_COUNT * 100))
echo "M2 (ZeroAskQuestion): $M2 (count: $AQ_COUNT)"

# M3: Context Stable
CONTEXT=$(tmux capture-pane -t pi-harness -p 2>/dev/null | grep -oE "[0-9]+%" | tail -1 || echo "0%")
M3=$(echo $CONTEXT | tr -d '%')
echo "M3 (ContextStable): ${M3}%"

# M4: Git Commit Rate
EXPECTED_COMMITS=$((total_tasks))
ACTUAL_COMMITS=$(git log --oneline --since="1 hour" | wc -l)
M4=$((ACTUAL_COMMITS * 100 / (EXPECTED_COMMITS + 1)))
echo "M4 (GitCommitRate): $M4% ($ACTUAL_COMMITS/$EXPECTED_COMMITS)"

# M5: Git Tag Rate
RECENT_TAGS=$(git tag --since="1 hour" | wc -l)
M5=$((RECENT_TAGS > 0 ? 100 : 0))
echo "M5 (GitTagRate): $M5%"

# M6: Test Pass Rate
TEST_OUTPUT=$(npm test -- --run 2>&1 | tail -20)
TEST_PASS=$(echo "$TEST_OUTPUT" | grep -cE "✓|PASS|passed" || echo 0)
TEST_FAIL=$(echo "$TEST_OUTPUT" | grep -cE "✗|FAIL|failed" || echo 0)
M6=$((TEST_PASS * 100 / (TEST_PASS + TEST_FAIL + 1)))
echo "M6 (TestPassRate): $M6%"

# M7: Cost Efficiency
TOTAL_COST=$(tmux capture-pane -t pi-harness -p 2>/dev/null | grep -oE "\$[0-9.]+" | tail -1 | tr -d '$' || echo "0")
TASKS_COMPLETED=$completed_tasks
COST_PER_TASK=$(echo "scale=2; $TOTAL_COST / ($TASKS_COMPLETED + 1)" | bc)
M7=$(echo "scale=0; 100 - ($COST_PER_TASK / 0.50 - 1) * 50" | bc | tr -d '-')
echo "M7 (CostEfficiency): \$$COST_PER_TASK/task"

# M8: Time Per Task
ELAPSED=$(tmux capture-pane -t pi-harness -p 2>/dev/null | grep -oE "[0-9]+min|[0-9]+s" | tail -1 || echo "0s")
M8=$(echo $ELAPSED | grep -oE "[0-9]+" || echo 0)
echo "M8 (TimePerTask): ${M8}s"

# M9: Learning Curve (compare with baseline)
echo ""
echo "=== LEARNING ANALYSIS ==="
if [ -f "$RALPH_DIR/history.json" ]; then
    PREV_SCORE=$(cat "$RALPH_DIR/history.json" | jq '.[-1].score')
    echo "Previous overall score: $PREV_SCORE"
fi

# M10-M15: Advanced metrics
echo ""
echo "=== ADVANCED METRICS ==="
echo "M10 (PatternRecognition): TODO"
echo "M11 (SelfCorrectionRate): TODO"
echo "M12 (ContextReuse): TODO"
echo "M13 (ErrorRecovery): TODO"
echo "M14 (KnowledgeRetention): TODO"
echo "M15 (DecisionQuality): TODO"

# Save to history
echo ""
echo "=== SAVING TO HISTORY ==="
cat > "$RALPH_DIR/eval-latest.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "metrics": {
    "M1": $M1, "M2": $M2, "M3": $M3, "M4": $M4,
    "M5": $M5, "M6": $M6, "M7": $M7, "M8": $M8
  },
  "context": "${CONTEXT}",
  "cost": "\$$TOTAL_COST"
}
EOF
echo "Saved to $RALPH_DIR/eval-latest.json"

# Calculate overall
echo ""
echo "=== OVERALL SCORE ==="
WEIGHTED=$(echo "scale=2; $M1*0.20 + $M2*0.20 + $M3*0.15 + $M4*0.10 + $M5*0.10 + $M6*0.10 + $M7*0.10 + $M8*0.05" | bc)
echo "Overall Score: $WEIGHTED"

if [ $WEIGHTED -ge 85 ]; then
    echo "Grade: A (Excellent)"
elif [ $WEIGHTED -ge 70 ]; then
    echo "Grade: B (Acceptable)"
else
    echo "Grade: C/D (Needs improvement)"
fi
```

---

## 🚀 SELF-EVOLUTION ENGINE

### Evolution Loop

```python
class SelfEvolutionEngine:
    def __init__(self):
        self.memory = PatternMemory()
        self.metrics = MetricsCollector()
        self.corrector = AutoCorrector()
        self.iteration = 0
    
    def run_cycle(self):
        """Execute one evolution cycle"""
        self.iteration += 1
        
        # 1. Collect metrics
        metrics = self.metrics.collect()
        
        # 2. Calculate score
        score = self.calculate_score(metrics)
        grade = self.get_grade(score)
        
        # 3. Log iteration
        self.log_iteration(metrics, score, grade)
        
        # 4. Analyze learning curve
        curve = self.analyze_learning_curve()
        
        # 5. Apply corrections if needed
        if grade in ["C", "D"]:
            corrections = self.corrector.determine_corrections(metrics)
            for correction in corrections:
                self.apply_correction(correction)
        
        # 6. Learn from this cycle
        self.learn_from_cycle(metrics, score)
        
        # 7. Suggest next action
        return self.suggest_next_action(score, curve, grade)
    
    def learn_from_cycle(self, metrics, score):
        """Store learnings for future reference"""
        if score >= 90:
            self.memory.store("what_works", {
                "iteration": self.iteration,
                "metrics": metrics,
                "score": score
            })
        else:
            self.memory.store("what_fails", {
                "iteration": self.iteration,
                "metrics": metrics,
                "score": score
            })
```

### Evolution Targets

| Phase | Score Target | Iterations | Time |
|-------|--------------|------------|------|
| v1.0 (Baseline) | 50% | 1-5 | 1h |
| v1.5 (Stable) | 70% | 6-15 | 2h |
| v2.0 (Good) | 85% | 16-30 | 4h |
| v2.5 (Excellent) | 95% | 31-50 | 8h |
| v3.0 (Autonomous) | 99% | 51+ | ongoing |

---

## 📋 HARNESS SELF-EVAL PROMPT

Copy this to pi:

```
# HARNESS SELF-EVAL SYSTEM

## Execute Full Eval

Run the eval script and collect all metrics:

M1: Auto-progression (target > 95%)
M2: Zero AskQuestion (target = 0)
M3: Context Stable (target < 50%)
M4: Git Commit Rate (target 100%)
M5: Git Tag Rate (target 100%)
M6: Test Pass Rate (target > 85%)
M7: Cost Efficiency (target < $0.50/task)
M8: Time Per Task (target < 2min)

## Calculate Overall Score

OVERALL = M1×20 + M2×20 + M3×15 + M4×10 + M5×10 + M6×10 + M7×10 + M8×5

## If Score < 85:

1. Identify worst metric
2. Apply correction from correction library
3. Test correction
4. Log to history

## If Score >= 85:

1. Log success
2. Identify 1 improvement for next cycle
3. Continue

## Learn From Cycle

Store in ~/.pi/agent/memory/harness/learnings/:
- What worked
- What failed
- Patterns discovered
- Correction effectiveness

## Evolution Check

Every 10 iterations:
- Analyze learning curve
- Calculate improvement rate
- Adjust targets if needed

Report:
```
## Eval Results - Iteration {N}

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| M1 | X% | >95% | ✅/❌ |
| M2 | X | 0 | ✅/❌ |
...

Overall: X/100 - Grade: X
Learning Curve: IMPROVING/STABLE/DEGRADING
Next Action: {action}
```
```

---

## 🎯 SUCCESS CRITERIA

### Level 1: Basic Autonomous (Score 70+)
- [ ] Auto-progression > 70%
- [ ] Zero AskUserQuestion
- [ ] Git commits automatic

### Level 2: Stable (Score 85+)
- [ ] All Level 1 criteria
- [ ] Context stable < 50%
- [ ] Git tags automatic
- [ ] Test pass rate > 85%

### Level 3: Efficient (Score 95+)
- [ ] All Level 2 criteria
- [ ] Auto-progression > 95%
- [ ] Cost < $0.30/task
- [ ] Time < 1min/task

### Level 4: Self-Evolving (Score 99+)
- [ ] All Level 3 criteria
- [ ] Self-correction without human
- [ ] Pattern learning
- [ ] Knowledge retention
- [ ] Exponential improvement

---

## 📁 File Structure

```
~/.pi/agent/
├── eval-system/
│   ├── eval-collector.sh      # Metrics collection
│   ├── scorer.py              # Score calculation
│   ├── corrector.py           # Auto-corrections
│   └── evolution.py           # Self-evolution engine
├── memory/
│   └── harness/
│       ├── history.json       # All iterations
│       ├── patterns/          # Learned patterns
│       ├── corrections/       # Applied corrections
│       └── learnings/         # What works/fails
└── harness/
    └── self-eval-prompt.md    # This file
```

---

## 🚦 RUNNING THE SYSTEM

```bash
# 1. Start harness
~/.pi/agent/bin/run-harness.sh start "Build feature X"

# 2. Run eval every 5 min
watch -n 300 ~/.pi/agent/eval-system/eval-collector.sh

# 3. Check evolution
tail -f ~/.ralph/history.json

# 4. Force self-correction if needed
curl -X POST localhost:8080/eval/trigger-correction
```

---

*Last Updated: 2026-05-28*
*Version: 2.0*
*Status: ACTIVE DEVELOPMENT*