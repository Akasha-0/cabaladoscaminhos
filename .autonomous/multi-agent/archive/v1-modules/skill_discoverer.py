"""
SkillDiscoverer: Autonomous skill discovery and management system.

Discovers new skills from observed agent behaviors using multiple pattern
detection algorithms, manages skill lifecycle, and persists skills to disk.

Pattern algorithms:
- frequent_itemset: Apriori-style frequent itemset mining on learning type tags
- success_sequence_detection: Phase-outcome automaton for detecting success sequences
- anti_pattern_detection: Identifies counterproductive behavioral patterns
- agent_behavior_clusters: Clusters agent behaviors to find common strategies
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
import sys
import time
from collections import Counter, defaultdict
from copy import deepcopy
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Callable, TypeVar

# ==============================================================================
# Constants
# ==============================================================================

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
SKILLS_FILE = MA / "skills.json"
HISTORY_FILE = MA / "behavior_history.json"
DISCOVERY_LOG = MA / "discovery_log.json"

MAX_SKILLS = 50
TICK_INTERVAL = 10  # iterations between auto-discovery
MIN_SUPPORT = 0.15  # minimum support for frequent itemset mining
MIN_CONFIDENCE = 0.6  # minimum confidence for association rules
SUCCESS_SEQUENCE_WINDOW = 5  # phases to consider in sequence detection
ANTI_PATTERN_THRESHOLD = 0.3  # threshold for anti-pattern detection
CLUSTER_MIN_SAMPLES = 3  # minimum samples for behavior clustering

# Learning type tags used for categorization
LEARNING_TAGS = [
    "pattern_recognition",
    "sequence_learning",
    "error_recovery",
    "strategy_adaptation",
    "collaborative",
    "autonomous",
    "investigative",
    "optimizing",
    "debugging",
    "architectural",
    "refactoring",
    "testing",
    "documentation",
    "deployment",
    "monitoring",
    "security",
    "performance",
    "data_handling",
    "api_design",
    "user_interface",
]

# Phase types for success sequence detection
PHASE_TYPES = [
    "investigation",
    "planning",
    "implementation",
    "verification",
    "deployment",
    "rollback",
    "failure",
]


# ==============================================================================
# Data Classes
# ==============================================================================

class DetectionType(str, Enum):
    """Types of pattern detection used for skill discovery."""
    FREQUENT_ITEMSET = "frequent_itemset"
    SUCCESS_SEQUENCE = "success_sequence"
    ANTI_PATTERN = "anti_pattern"
    BEHAVIOR_CLUSTER = "behavior_cluster"
    RULE_BASED = "rule_based"


class Pattern:
    """Pattern data for a discovered skill."""
    detection_type: DetectionType
    def __init__(self, detection_type: DetectionType, data: dict[str, Any]) -> None:
        self.detection_type = detection_type
        self.data = data

    def to_dict(self) -> dict[str, Any]:
        return {
            "detection_type": self.detection_type.value if isinstance(self.detection_type, DetectionType) else self.detection_type,
            "data": self.data,
        }
    
    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> Pattern:
        dt = d.get("detection_type", "frequent_itemset")
        if isinstance(dt, str):
            dt = DetectionType(dt)
        return cls(detection_type=dt, data=d.get("data", {}))


@dataclass
class Skill:
    """Represents a discovered skill with metadata and pattern information."""
    id: str
    name: str
    description: str
    pattern: Pattern
    success_count: int = 0
    failure_count: int = 0
    last_used: float | None = None
    active: bool = True
    discovered_at: float = field(default_factory=lambda: time.time())
    
    @property
    def success_rate(self) -> float:
        """Calculate skill success rate."""
        total = self.success_count + self.failure_count
        if total == 0:
            return 0.0
        return self.success_count / total
    
    @property
    def total_uses(self) -> int:
        """Total number of times the skill has been used."""
        return self.success_count + self.failure_count
    
    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "pattern": self.pattern.to_dict(),
            "success_count": self.success_count,
            "failure_count": self.failure_count,
            "last_used": self.last_used,
            "active": self.active,
            "discovered_at": self.discovered_at,
        }
    
    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> Skill:
        return cls(
            id=d["id"],
            name=d["name"],
            description=d["description"],
            pattern=Pattern.from_dict(d.get("pattern", {})),
            success_count=d.get("success_count", 0),
            failure_count=d.get("failure_count", 0),
            last_used=d.get("last_used"),
            active=d.get("active", True),
            discovered_at=d.get("discovered_at", time.time()),
        )


@dataclass
class BehaviorEvent:
    """A single behavior event observed from an agent."""
    timestamp: float
    agent_id: str
    event_type: str
    tags: list[str]
    phase: str
    outcome: str  # "success", "failure", "partial"
    metadata: dict[str, Any] = field(default_factory=dict)
    duration_ms: float | None = None
    iteration: int = 0
    
    def to_dict(self) -> dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "agent_id": self.agent_id,
            "event_type": self.event_type,
            "tags": self.tags,
            "phase": self.phase,
            "outcome": self.outcome,
            "metadata": self.metadata,
            "duration_ms": self.duration_ms,
            "iteration": self.iteration,
        }
    
    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> BehaviorEvent:
        return cls(
            timestamp=d.get("timestamp", time.time()),
            agent_id=d.get("agent_id", "unknown"),
            event_type=d.get("event_type", "unknown"),
            tags=d.get("tags", []),
            phase=d.get("phase", "unknown"),
            outcome=d.get("outcome", "unknown"),
            metadata=d.get("metadata", {}),
            duration_ms=d.get("duration_ms"),
            iteration=d.get("iteration", 0),
        )


@dataclass 
class EvaluationResult:
    """Result of skill evaluation."""
    verdict: str  # "effective", "neutral", "harmful"
    delta: float  # change in success rate (positive = improvement)
    confidence: float  # confidence in the evaluation
    sample_size: int
    details: dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> dict[str, Any]:
        return {
            "verdict": self.verdict,
            "delta": self.delta,
            "confidence": self.confidence,
            "sample_size": self.sample_size,
            "details": self.details,
        }


# ==============================================================================
# Utility Functions
# ==============================================================================

T = TypeVar("T")


def load_json(path: Path) -> Any:
    """Load JSON from file, returning empty structure on failure."""
    try:
        if not path.exists():
            return None
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"Warning: Failed to load {path}: {e}", file=sys.stderr)
        return None


def save_json(path: Path, data: Any) -> bool:
    """Save data to JSON file atomically."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        # Write to temp file first for atomicity
        temp_path = path.with_suffix(".tmp")
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        temp_path.replace(path)
        return True
    except OSError as e:
        print(f"Warning: Failed to save {path}: {e}", file=sys.stderr)
        return False


def generate_id(*parts: str) -> str:
    """Generate a deterministic ID from parts."""
    content = "|".join(str(p) for p in parts)
    return hashlib.sha256(content.encode()).hexdigest()[:16]


def timestamp_now() -> float:
    """Get current timestamp."""
    return time.time()


# ==============================================================================
# Frequent Itemset Mining (Apriori-style)
# ==============================================================================

class FrequentItemsetMiner:
    """
    Apriori-style frequent itemset mining algorithm.
    
    Discovers frequently co-occurring learning tags that correlate with
    successful outcomes, generating candidate skills from the patterns.
    """
    
    def __init__(self, min_support: float = MIN_SUPPORT):
        self.min_support = min_support
        self.frequent_itemsets: list[set[str]] = []
        self.association_rules: list[dict[str, Any]] = []
    
    def fit(self, transactions: list[list[str]]) -> list[set[str]]:
        """
        Find all frequent itemsets in the transactions.
        
        Args:
            transactions: List of itemset transactions (e.g., tag lists)
            
        Returns:
            List of frequent itemsets
        """
        if not transactions:
            return []
        
        n_transactions = len(transactions)
        
        # Count individual items
        item_counts: Counter[str] = Counter()
        for transaction in transactions:
            for item in set(transaction):
                item_counts[item] += 1
        
        # Find frequent 1-itemsets
        frequent_1: list[str] = []
        for item, count in item_counts.items():
            support = count / n_transactions
            if support >= self.min_support:
                frequent_1.append(item)
        
        if not frequent_1:
            return []
        
        # Build frequent itemsets using Apriori property
        current_frequent: list[set[str]] = [frozenset([item]) for item in frequent_1]
        all_frequent: list[set[str]] = list(current_frequent)
        
        k = 2
        while current_frequent:
            # Generate candidates of size k
            candidates = self._generate_candidates(current_frequent, k)
            
            # Count support for candidates
            candidate_counts: Counter[frozenset[str]] = Counter()
            for transaction in transactions:
                transaction_set = frozenset(transaction)
                for candidate in candidates:
                    if candidate.issubset(transaction_set):
                        candidate_counts[candidate] += 1
            
            # Filter by minimum support
            current_frequent = []
            for candidate, count in candidate_counts.items():
                support = count / n_transactions
                if support >= self.min_support:
                    current_frequent.append(candidate)
                    all_frequent.append(set(candidate))
            
            k += 1
        
        self.frequent_itemsets = [set(itemset) for itemset in all_frequent]
        return self.frequent_itemsets
    
    def _generate_candidates(
        self, frequent_sets: list[frozenset[str]], k: int
    ) -> list[frozenset[str]]:
        """Generate candidate k-itemsets from frequent (k-1)-itemsets."""
        candidates: list[frozenset[str]] = []
        n = len(frequent_sets)
        
        for i in range(n):
            for j in range(i + 1, n):
                union = frequent_sets[i] | frequent_sets[j]
                if len(union) == k:
                    # Check if all (k-1)-subsets are frequent
                    if self._has_frequent_subsets(union, frequent_sets):
                        if union not in candidates:
                            candidates.append(union)
        
        return candidates
    
    def _has_frequent_subsets(
        self, itemset: frozenset[str], frequent_sets: list[frozenset[str]]
    ) -> bool:
        """Check if all (k-1)-subsets of itemset are frequent."""
        frequent_set = set(frequent_sets)
        for item in itemset:
            subset = itemset - {item}
            if frozenset(subset) not in frequent_set:
                return False
        return True
    
    def generate_rules(
        self, transactions: list[list[str]], outcomes: list[bool]
    ) -> list[dict[str, Any]]:
        """
        Generate association rules linking itemsets to outcomes.
        
        Args:
            transactions: List of transactions
            outcomes: List of outcome booleans (True = success)
            
        Returns:
            List of association rules with confidence and lift
        """
        if not transactions or len(transactions) != len(outcomes):
            return []
        
        n_transactions = len(transactions)
        n_success = sum(outcomes)
        n_failure = len(outcomes) - n_success
        
        rules = []
        
        for itemset in self.frequent_itemsets:
            if len(itemset) < 1:
                continue
            
            # Count transactions containing itemset
            itemset_count = 0
            itemset_success_count = 0
            
            for transaction, outcome in zip(transactions, outcomes):
                transaction_set = set(transaction)
                if itemset.issubset(transaction_set):
                    itemset_count += 1
                    if outcome:
                        itemset_success_count += 1
            
            if itemset_count == 0:
                continue
            
            support = itemset_count / n_transactions
            confidence = itemset_success_count / itemset_count if itemset_count > 0 else 0
            
            # Calculate lift
            expected_confidence = n_success / n_transactions if n_transactions > 0 else 0
            lift = confidence / expected_confidence if expected_confidence > 0 else 0
            
            if confidence >= MIN_CONFIDENCE and lift > 1.0:
                rules.append({
                    "antecedent": list(itemset),
                    "consequent": "success",
                    "support": support,
                    "confidence": confidence,
                    "lift": lift,
                    "success_rate": confidence,
                })
        
        self.association_rules = rules
        return rules
    
    def discover_skills(
        self, events: list[BehaviorEvent]
    ) -> list[dict[str, Any]]:
        """
        Discover skills from behavior events using frequent itemset mining.
        
        Args:
            events: List of behavior events with tags and outcomes
            
        Returns:
            List of discovered skill definitions
        """
        if len(events) < 5:
            return []
        
        # Build transactions and outcomes
        transactions = [event.tags for event in events]
        outcomes = [event.outcome == "success" for event in events]
        
        # Find frequent itemsets
        self.fit(transactions)
        
        # Generate association rules
        rules = self.generate_rules(transactions, outcomes)
        
        # Convert rules to skill definitions
        skills = []
        seen_ids = set()
        
        for rule in rules:
            antecedent = rule["antecedent"]
            if len(antecedent) < 1:
                continue
            
            # Generate skill name from dominant tag
            primary_tag = antecedent[0] if antecedent else "unknown"
            skill_id = generate_id("fis", primary_tag, *antecedent)
            
            if skill_id in seen_ids:
                continue
            seen_ids.add(skill_id)
            
            skill_def = {
                "id": skill_id,
                "name": self._generate_skill_name(antecedent),
                "description": self._generate_description(antecedent, rule),
                "pattern": {
                    "detection_type": DetectionType.FREQUENT_ITEMSET.value,
                    "data": {
                        "antecedent": antecedent,
                        "support": rule["support"],
                        "confidence": rule["confidence"],
                        "lift": rule["lift"],
                        "success_rate": rule["success_rate"],
                    },
                },
            }
            skills.append(skill_def)
        
        return skills
    
    def _generate_skill_name(self, antecedent: list[str]) -> str:
        """Generate a readable skill name from tags."""
        if not antecedent:
            return "Unknown Skill"
        
        # Pick the most descriptive tag
        primary = antecedent[0].replace("_", " ").title()
        
        if len(antecedent) == 1:
            return f"{primary} Expert"
        elif len(antecedent) == 2:
            return f"{primary} & {antecedent[1].replace('_', ' ').title()}"
        else:
            return f"{primary} Composite"
    
    def _generate_description(
        self, antecedent: list[str], rule: dict[str, Any]
    ) -> str:
        """Generate a skill description from tags and rule metrics."""
        tags_str = ", ".join(antecedent[:3])
        if len(antecedent) > 3:
            tags_str += f" and {len(antecedent) - 3} more"
        
        conf_pct = int(rule["confidence"] * 100)
        lift_val = rule.get("lift", 1.0)
        
        return (
            f"Discovered through frequent itemset analysis: when agents exhibit "
            f"behaviors tagged with [{tags_str}], success occurs {conf_pct}% of the time "
            f"(lift={lift_val:.2f}). This pattern was detected across multiple "
            f"learning type tags indicating {antecedent[0].replace('_', ' ')} capability."
        )


# ==============================================================================
# Success Sequence Detection
# ==============================================================================

class SuccessSequenceDetector:
    """
    Phase-outcome automaton for detecting successful action sequences.
    
    Analyzes sequences of phases and their outcomes to identify patterns
    that consistently lead to successful task completion.
    """
    
    def __init__(self, window_size: int = SUCCESS_SEQUENCE_WINDOW):
        self.window_size = window_size
        self.sequences: list[dict[str, Any]] = []
        self.automaton: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    
    def fit(self, events: list[BehaviorEvent]) -> list[dict[str, Any]]:
        """
        Build phase-outcome automaton from events.
        
        Args:
            events: List of behavior events ordered by time
        """
        if len(events) < 3:
            return []
        
        # Group events by agent
        agent_events: dict[str, list[BehaviorEvent]] = defaultdict(list)
        for event in events:
            agent_events[event.agent_id].append(event)
        
        # Sort events within each agent by timestamp
        for agent_id in agent_events:
            agent_events[agent_id].sort(key=lambda e: e.timestamp)
        
        # Build automaton: state = (phase, outcome), transitions to next (phase, outcome)
        for agent_id, evts in agent_events.items():
            for i in range(len(evts) - 1):
                current = (evts[i].phase, evts[i].outcome)
                next_event = evts[i + 1]
                
                # Only track sequences that end in success
                if next_event.outcome == "success":
                    next_state = (next_event.phase, next_event.outcome)
                    self.automaton[current][next_state] += 1
        
        return self.sequences
    
    def detect_success_sequences(
        self, events: list[BehaviorEvent]
    ) -> list[dict[str, Any]]:
        """
        Detect sequences that lead to success.
        
        Args:
            events: List of behavior events
            
        Returns:
            List of detected success sequence patterns
        """
        if len(events) < self.window_size:
            return []
        
        # Group events by agent
        agent_events: dict[str, list[BehaviorEvent]] = defaultdict(list)
        for event in events:
            agent_events[event.agent_id].append(event)
        
        # Sort and extract phase sequences
        all_sequences: list[tuple[str, ...]] = []
        all_outcomes: list[tuple[str, ...]] = []
        
        for agent_id, evts in agent_events.items():
            evts.sort(key=lambda e: e.timestamp)
            
            # Extract phase sequence
            phases = tuple(e.phase for e in evts)
            outcomes = tuple(e.outcome for e in evts)
            
            if len(phases) >= self.window_size:
                all_sequences.append(phases)
                all_outcomes.append(outcomes)
        
        # Find common success-leading sequences
        sequence_counts: Counter[tuple[str, ...]] = Counter()
        
        for phases, outcomes in zip(all_sequences, all_outcomes):
            # Slide window
            for i in range(len(phases) - self.window_size + 1):
                window = phases[i:i + self.window_size]
                window_outcome = outcomes[i + self.window_size - 1]
                
                # If sequence ends in success, count it
                if window_outcome == "success":
                    sequence_counts[window] += 1
        
        # Filter by minimum occurrence
        total_success_sequences = sum(sequence_counts.values())
        if total_success_sequences == 0:
            return []
        
        patterns = []
        for seq, count in sequence_counts.most_common(20):
            support = count / total_success_sequences
            if support >= MIN_SUPPORT:
                patterns.append({
                    "sequence": list(seq),
                    "support": support,
                    "count": count,
                })
        
        self.sequences = patterns
        return patterns
    
    def discover_skills(
        self, events: list[BehaviorEvent]
    ) -> list[dict[str, Any]]:
        """
        Discover skills from success sequences.
        
        Args:
            events: List of behavior events
            
        Returns:
            List of discovered skill definitions
        """
        patterns = self.detect_success_sequences(events)
        
        skills = []
        seen_ids = set()
        
        for pattern in patterns:
            seq = pattern["sequence"]
            if not seq:
                continue
            
            # Generate skill from sequence
            start_phase = seq[0]
            end_phase = seq[-1]
            primary_tag = start_phase
            
            skill_id = generate_id("ssd", primary_tag, *seq)
            
            if skill_id in seen_ids:
                continue
            seen_ids.add(skill_id)
            
            skill_def = {
                "id": skill_id,
                "name": self._generate_skill_name(seq),
                "description": self._generate_description(seq, pattern),
                "pattern": {
                    "detection_type": DetectionType.SUCCESS_SEQUENCE.value,
                    "data": {
                        "sequence": seq,
                        "support": pattern["support"],
                        "count": pattern["count"],
                        "start_phase": start_phase,
                        "end_phase": end_phase,
                    },
                },
            }
            skills.append(skill_def)
        
        return skills
    
    def _generate_skill_name(self, sequence: list[str]) -> str:
        """Generate skill name from phase sequence."""
        if not sequence:
            return "Success Sequence"
        
        start = sequence[0].title()
        end = sequence[-1].title()
        
        if len(sequence) <= 3:
            return f"{start} to {end} Navigator"
        else:
            return f"{start}-Based Success Path"
    
    def _generate_description(
        self, sequence: list[str], pattern: dict[str, Any]
    ) -> str:
        """Generate description from sequence pattern."""
        phases_str = " → ".join(sequence)
        support_pct = int(pattern["support"] * 100)
        count = pattern["count"]
        
        return (
            f"Detected through success sequence analysis: the phase pattern "
            f"[{phases_str}] leads to successful outcomes {support_pct}% of the time "
            f"(observed {count} times). This sequence automaton suggests that "
            f"following the {sequence[0]} → {sequence[-1]} path is a reliable "
            f"strategy for task completion."
        )


# ==============================================================================
# Anti-Pattern Detection
# ==============================================================================

class AntiPatternDetector:
    """
    Detects counterproductive behavioral patterns that lead to failures.
    
    Identifies patterns where certain combinations of tags or sequences
    correlate with poor outcomes, allowing the system to warn against
    or avoid these patterns.
    """
    
    def __init__(self, threshold: float = ANTI_PATTERN_THRESHOLD):
        self.threshold = threshold
        self.anti_patterns: list[dict[str, Any]] = []
    
    def fit(
        self, events: list[BehaviorEvent]
    ) -> list[dict[str, Any]]:
        """
        Identify anti-patterns in behavior events.
        
        Args:
            events: List of behavior events
            
        Returns:
            List of detected anti-patterns
        """
        if len(events) < 10:
            return []
        
        # Group by tags and calculate failure rates
        tag_failure_rates: dict[str, float] = defaultdict(lambda: [0, 0])
        
        for event in events:
            for tag in event.tags:
                tag_failure_rates[tag][1] += 1
                if event.outcome == "failure":
                    tag_failure_rates[tag][0] += 1
        
        # Find tags with high failure rates
        anti_patterns = []
        
        for tag, (failures, total) in tag_failure_rates.items():
            if total < 3:
                continue
            
            failure_rate = failures / total
            
            if failure_rate >= self.threshold:
                anti_patterns.append({
                    "type": "high_failure_tag",
                    "tag": tag,
                    "failure_rate": failure_rate,
                    "total_occurrences": total,
                    "description": f"Tag '{tag}' is associated with {int(failure_rate*100)}% failure rate",
                })
        
        # Detect tag combinations that fail together
        tag_pair_failure_rates: dict[str, tuple[int, int]] = defaultdict(lambda: [0, 0])
        
        for event in events:
            tags = sorted(event.tags)
            for i, tag1 in enumerate(tags):
                for tag2 in tags[i + 1:]:
                    pair_key = f"{tag1}|{tag2}"
                    tag_pair_failure_rates[pair_key][1] += 1
                    if event.outcome == "failure":
                        tag_pair_failure_rates[pair_key][0] += 1
        
        for pair, (failures, total) in tag_pair_failure_rates.items():
            if total < 3:
                continue
            
            failure_rate = failures / total
            
            if failure_rate >= self.threshold:
                parts = pair.split("|")
                anti_patterns.append({
                    "type": "failure_tag_pair",
                    "tags": parts,
                    "failure_rate": failure_rate,
                    "total_occurrences": total,
                    "description": f"Combination [{parts[0]}, {parts[1]}] fails {int(failure_rate*100)}% of the time",
                })
        
        # Detect failure sequences
        failure_sequences = self._detect_failure_sequences(events)
        anti_patterns.extend(failure_sequences)
        
        self.anti_patterns = anti_patterns
        return anti_patterns
    
    def _detect_failure_sequences(
        self, events: list[BehaviorEvent]
    ) -> list[dict[str, Any]]:
        """Detect phase sequences that lead to failure."""
        if len(events) < 5:
            return []
        
        # Group by agent
        agent_events: dict[str, list[BehaviorEvent]] = defaultdict(list)
        for event in events:
            agent_events[event.agent_id].append(event)
        
        for agent_id in agent_events:
            agent_events[agent_id].sort(key=lambda e: e.timestamp)
        
        # Find sequences ending in failure
        failure_sequence_counts: Counter[tuple[str, ...]] = Counter()
        
        for agent_id, evts in agent_events.items():
            for i in range(len(evts) - 1):
                window_end = min(i + SUCCESS_SEQUENCE_WINDOW, len(evts))
                window = tuple(e.phase for e in evts[i:window_end])
                
                # Check if this window ends in failure
                last_outcome = evts[window_end - 1].outcome
                if last_outcome == "failure":
                    failure_sequence_counts[window] += 1
        
        patterns = []
        total_failure_sequences = sum(failure_sequence_counts.values())
        
        if total_failure_sequences == 0:
            return []
        
        for seq, count in failure_sequence_counts.items():
            rate = count / total_failure_sequences
            if rate >= self.threshold:
                patterns.append({
                    "type": "failure_sequence",
                    "sequence": list(seq),
                    "failure_rate": rate,
                    "count": count,
                    "description": f"Sequence [{' → '.join(seq)}] leads to failure {int(rate*100)}% of the time",
                })
        
        return patterns
    
    def discover_skills(
        self, events: list[BehaviorEvent]
    ) -> list[dict[str, Any]]:
        """
        Generate avoidance skills from anti-patterns.
        
        Args:
            events: List of behavior events
            
        Returns:
            List of skill definitions for avoiding anti-patterns
        """
        anti_patterns = self.fit(events)
        
        skills = []
        seen_ids = set()
        
        for ap in anti_patterns:
            ap_type = ap["type"]
            skill_id = generate_id("anti", ap_type, str(ap.get("tag", ap.get("tags", ap.get("sequence", [])))))
            
            if skill_id in seen_ids:
                continue
            seen_ids.add(skill_id)
            
            skill_def = {
                "id": skill_id,
                "name": self._generate_skill_name(ap),
                "description": ap.get("description", "Detected anti-pattern"),
                "pattern": {
                    "detection_type": DetectionType.ANTI_PATTERN.value,
                    "data": ap,
                },
            }
            skills.append(skill_def)
        
        return skills
    
    def _generate_skill_name(self, anti_pattern: dict[str, Any]) -> str:
        """Generate skill name from anti-pattern."""
        ap_type = anti_pattern["type"]
        
        if ap_type == "high_failure_tag":
            tag = anti_pattern["tag"].replace("_", " ").title()
            return f"Avoid {tag} Anti-Pattern"
        elif ap_type == "failure_tag_pair":
            tags = [t.replace("_", " ").title() for t in anti_pattern["tags"]]
            return f"Skip {tags[0]}-{tags[1]} Combo"
        elif ap_type == "failure_sequence":
            seq = anti_pattern["sequence"]
            return f"Break {seq[0].title()} Failure Loop"
        
        return "Anti-Pattern Avoidance Skill"


# ==============================================================================
# Agent Behavior Clustering
# ==============================================================================

class AgentBehaviorClusterer:
    """
    Clusters agent behaviors to find common successful strategies.
    
    Uses simple clustering based on tag frequency vectors to group
    similar agent behaviors and identify the most successful clusters.
    """
    
    def __init__(self, min_samples: int = CLUSTER_MIN_SAMPLES):
        self.min_samples = min_samples
        self.clusters: list[dict[str, Any]] = []
    
    def fit(self, events: list[BehaviorEvent]) -> list[dict[str, Any]]:
        """
        Cluster behavior events by tag frequency vectors.
        
        Args:
            events: List of behavior events
            
        Returns:
            List of discovered clusters
        """
        if len(events) < self.min_samples * 2:
            return []
        
        # Build tag frequency vectors for each agent
        agent_vectors: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
        agent_outcomes: dict[str, list[str]] = defaultdict(list)
        
        for event in events:
            for tag in event.tags:
                agent_vectors[event.agent_id][tag] += 1
            agent_outcomes[event.agent_id].append(event.outcome)
        
        if len(agent_vectors) < self.min_samples:
            return []
        
        # Calculate success rates
        agent_success_rates: dict[str, float] = {}
        for agent_id, outcomes in agent_outcomes.items():
            successes = sum(1 for o in outcomes if o == "success")
            agent_success_rates[agent_id] = successes / len(outcomes) if outcomes else 0
        
        # Build feature vectors
        all_tags = set()
        for vec in agent_vectors.values():
            all_tags.update(vec.keys())
        
        tag_list = sorted(all_tags)
        tag_index = {tag: i for i, tag in enumerate(tag_list)}
        
        agent_ids = list(agent_vectors.keys())
        n_agents = len(agent_ids)
        
        if n_agents < 2:
            return []
        
        # Simple k-means clustering with k=min(5, n_agents-1)
        k = min(5, n_agents - 1)
        
        # Initialize centroids randomly
        import random
        random.seed(42)
        
        centroid_indices = random.sample(range(n_agents), k)
        centroids = []
        for idx in centroid_indices:
            agent_id = agent_ids[idx]
            vec = agent_vectors[agent_id]
            centroid = [vec.get(tag, 0) for tag in tag_list]
            # Normalize
            norm = math.sqrt(sum(x**2 for x in centroid))
            if norm > 0:
                centroid = [x / norm for x in centroid]
            centroids.append(centroid)
        
        # Iterate
        max_iterations = 20
        assignments = [-1] * n_agents
        
        for _ in range(max_iterations):
            # Assign points to nearest centroid
            changed = False
            for i, agent_id in enumerate(agent_ids):
                vec = agent_vectors[agent_id]
                features = [vec.get(tag, 0) for tag in tag_list]
                norm = math.sqrt(sum(x**2 for x in features))
                if norm > 0:
                    features = [x / norm for x in features]
                
                # Find nearest centroid
                best_dist = float("inf")
                best_centroid = 0
                for c_idx, centroid in enumerate(centroids):
                    dist = sum((f - c) ** 2 for f, c in zip(features, centroid))
                    if dist < best_dist:
                        best_dist = dist
                        best_centroid = c_idx
                
                if assignments[i] != best_centroid:
                    assignments[i] = best_centroid
                    changed = True
            
            if not changed:
                break
            
            # Update centroids
            for c_idx in range(k):
                members = [
                    agent_ids[i] for i in range(n_agents) if assignments[i] == c_idx
                ]
                if not members:
                    continue
                
                new_centroid = [0.0] * len(tag_list)
                for agent_id in members:
                    vec = agent_vectors[agent_id]
                    for j, tag in enumerate(tag_list):
                        new_centroid[j] += vec.get(tag, 0)
                
                norm = math.sqrt(sum(x**2 for x in new_centroid))
                if norm > 0:
                    new_centroid = [x / norm for x in new_centroid]
                centroids[c_idx] = new_centroid
        
        # Build clusters with statistics
        clusters = []
        for c_idx in range(k):
            members = [
                (agent_ids[i], agent_success_rates[agent_ids[i]])
                for i in range(n_agents)
                if assignments[i] == c_idx
            ]
            
            if len(members) < self.min_samples:
                continue
            
            avg_success = sum(s for _, s in members) / len(members)
            
            # Find dominant tags for this cluster
            cluster_tag_counts: Counter[str] = Counter()
            for agent_id in [m[0] for m in members]:
                for tag in agent_vectors[agent_id]:
                    cluster_tag_counts[tag] += agent_vectors[agent_id][tag]
            
            dominant_tags = [tag for tag, _ in cluster_tag_counts.most_common(5)]
            
            clusters.append({
                "cluster_id": c_idx,
                "size": len(members),
                "avg_success_rate": avg_success,
                "dominant_tags": dominant_tags,
                "members": [m[0] for m in members],
            })
        
        # Sort by success rate
        clusters.sort(key=lambda c: c["avg_success_rate"], reverse=True)
        
        self.clusters = clusters
        return clusters
    
    def discover_skills(
        self, events: list[BehaviorEvent]
    ) -> list[dict[str, Any]]:
        """
        Discover skills from successful behavior clusters.
        
        Args:
            events: List of behavior events
            
        Returns:
            List of skill definitions from top clusters
        """
        clusters = self.fit(events)
        
        skills = []
        seen_ids = set()
        
        for cluster in clusters[:5]:  # Top 5 clusters
            if cluster["avg_success_rate"] < 0.5:
                continue
            
            dominant_tags = cluster["dominant_tags"]
            if not dominant_tags:
                continue
            
            primary_tag = dominant_tags[0]
            skill_id = generate_id("cluster", primary_tag, str(cluster["cluster_id"]))
            
            if skill_id in seen_ids:
                continue
            seen_ids.add(skill_id)
            
            skill_def = {
                "id": skill_id,
                "name": self._generate_skill_name(cluster),
                "description": self._generate_description(cluster),
                "pattern": {
                    "detection_type": DetectionType.BEHAVIOR_CLUSTER.value,
                    "data": {
                        "cluster_id": cluster["cluster_id"],
                        "dominant_tags": dominant_tags,
                        "avg_success_rate": cluster["avg_success_rate"],
                        "size": cluster["size"],
                    },
                },
            }
            skills.append(skill_def)
        
        return skills
    
    def _generate_skill_name(self, cluster: dict[str, Any]) -> str:
        """Generate skill name from cluster."""
        tags = cluster["dominant_tags"]
        if not tags:
            return "Behavior Cluster Strategy"
        
        primary = tags[0].replace("_", " ").title()
        return f"{primary} Cluster Strategy"
    
    def _generate_description(self, cluster: dict[str, Any]) -> str:
        """Generate description from cluster."""
        tags = cluster["dominant_tags"]
        success_pct = int(cluster["avg_success_rate"] * 100)
        size = cluster["size"]
        
        tags_str = ", ".join(tags[:3])
        
        return (
            f"Discovered through behavior clustering: agents exhibiting "
            f"tag patterns [{tags_str}] achieve {success_pct}% success rate "
            f"(based on {size} behavioral samples). This cluster represents "
            f"a proven strategy when working with {tags[0].replace('_', ' ')} "
            f"type tasks."
        )


# ==============================================================================
# Rule-Based Skill Generator
# ==============================================================================

class RuleBasedSkillGenerator:
    """
    Generates skills from heuristic rules about effective behaviors.
    
    Uses domain knowledge rules to identify promising skill patterns
    that may not emerge from pure data mining.
    """
    
    def __init__(self):
        self.rules: list[dict[str, Any]] = [
            {
                "name": "Error Recovery Pattern",
                "description": "Agents that detect and recover from errors perform better",
                "condition": lambda e: "error_recovery" in e.tags and e.outcome == "success",
                "tags": ["error_recovery", "debugging"],
            },
            {
                "name": "Collaborative Problem Solving",
                "description": "Collaboration between agents improves outcomes",
                "condition": lambda e: "collaborative" in e.tags and e.outcome == "success",
                "tags": ["collaborative", "investigative"],
            },
            {
                "name": "Strategic Planning",
                "description": "Planning before implementation reduces failures",
                "condition": lambda e: "planning" in e.tags and e.outcome == "success",
                "tags": ["planning", "architectural"],
            },
            {
                "name": "Iterative Refinement",
                "description": "Continuous refinement leads to better results",
                "condition": lambda e: "refactoring" in e.tags and e.outcome == "success",
                "tags": ["refactoring", "optimizing"],
            },
            {
                "name": "Verification First",
                "description": "Verifying before deployment catches issues early",
                "condition": lambda e: "testing" in e.tags and e.outcome == "success",
                "tags": ["testing", "verification"],
            },
        ]
    
    def discover_skills(
        self, events: list[BehaviorEvent]
    ) -> list[dict[str, Any]]:
        """
        Discover skills matching rule-based patterns.
        
        Args:
            events: List of behavior events
            
        Returns:
            List of skill definitions from rules
        """
        skills = []
        seen_ids = set()
        
        for rule in self.rules:
            # Count matching successful events
            matches = sum(1 for e in events if rule["condition"](e))
            
            if matches >= 3:
                skill_id = generate_id("rule", rule["name"])
                
                if skill_id in seen_ids:
                    continue
                seen_ids.add(skill_id)
                
                skill_def = {
                    "id": skill_id,
                    "name": rule["name"],
                    "description": rule["description"] + f" (observed {matches} times)",
                    "pattern": {
                        "detection_type": DetectionType.RULE_BASED.value,
                        "data": {
                            "rule_name": rule["name"],
                            "match_count": matches,
                            "tags": rule["tags"],
                        },
                    },
                }
                skills.append(skill_def)
        
        return skills


# ==============================================================================
# SkillDiscoverer
# ==============================================================================

class SkillDiscoverer:
    """
    Main class for discovering, managing, and applying learned skills.
    
    Combines multiple pattern detection algorithms to identify effective
    agent behaviors, manages skill lifecycle, and provides evaluation
    feedback for continuous improvement.
    
    Usage:
        discoverer = SkillDiscoverer()
        discoverer.record_event(behavior_event)
        
        if discoverer.tick():
            new_skills = discoverer.discover()
            for skill in new_skills:
                discoverer.apply_skill(skill["id"])
        
        skills = discoverer.get_skills()
        result = discoverer.evaluate_skill("skill_id")
    """
    
    def __init__(
        self,
        skills_path: Path | None = None,
        history_path: Path | None = None,
        max_skills: int = MAX_SKILLS,
        tick_interval: int = TICK_INTERVAL,
    ):
        """
        Initialize the SkillDiscoverer.
        
        Args:
            skills_path: Path to skills JSON file
            history_path: Path to behavior history JSON file
            max_skills: Maximum number of skills to maintain
            tick_interval: Iterations between auto-discovery
        """
        self.skills_path = skills_path or SKILLS_FILE
        self.history_path = history_path or HISTORY_FILE
        self.max_skills = max_skills
        self.tick_interval = tick_interval
        
        # Internal state
        self._skills: dict[str, Skill] = {}
        self._history: list[BehaviorEvent] = []
        self._iteration: int = 0
        self._pending_discoveries: list[dict[str, Any]] = []
        
        # Pattern detectors
        self._frequent_miner = FrequentItemsetMiner()
        self._sequence_detector = SuccessSequenceDetector()
        self._anti_pattern_detector = AntiPatternDetector()
        self._clusterer = AgentBehaviorClusterer()
        self._rule_generator = RuleBasedSkillGenerator()
        
        # Load existing data
        self._load_skills()
        self._load_history()
    
    # =========================================================================
    # Persistence
    # =========================================================================
    
    def _load_skills(self) -> None:
        """Load skills from disk."""
        data = load_json(self.skills_path)
        if data is None:
            return
        
        skills_list = data if isinstance(data, list) else data.get("skills", [])
        
        for skill_dict in skills_list:
            try:
                skill = Skill.from_dict(skill_dict)
                self._skills[skill.id] = skill
            except (KeyError, TypeError) as e:
                print(f"Warning: Failed to load skill: {e}", file=sys.stderr)
                continue
    
    def _save_skills(self) -> None:
        """Save skills to disk."""
        skills_list = [skill.to_dict() for skill in self._skills.values()]
        save_json(self.skills_path, skills_list)
    
    def _load_history(self) -> None:
        """Load behavior history from disk."""
        data = load_json(self.history_path)
        if data is None:
            return
        
        history_list = data if isinstance(data, list) else data.get("history", [])
        
        for event_dict in history_list:
            try:
                event = BehaviorEvent.from_dict(event_dict)
                self._history.append(event)
            except (KeyError, TypeError) as e:
                print(f"Warning: Failed to load history event: {e}", file=sys.stderr)
                continue
    
    def _save_history(self) -> None:
        """Save behavior history to disk."""
        # Limit history size to prevent unbounded growth
        max_history = 10000
        history_to_save = self._history[-max_history:]
        history_list = [event.to_dict() for event in history_to_save]
        save_json(self.history_path, history_list)
    
    # =========================================================================
    # Event Recording
    # =========================================================================
    
    def record_event(
        self,
        agent_id: str,
        event_type: str,
        tags: list[str],
        phase: str,
        outcome: str,
        metadata: dict[str, Any] | None = None,
        duration_ms: float | None = None,
    ) -> None:
        """
        Record a behavior event for future pattern analysis.
        
        Args:
            agent_id: ID of the agent that performed the behavior
            event_type: Type of event (e.g., "tool_call", "decision", "message")
            tags: Learning type tags associated with this behavior
            phase: Current phase of execution
            outcome: Outcome of the behavior ("success", "failure", "partial")
            metadata: Additional event metadata
            duration_ms: Duration of the event in milliseconds
        """
        # Validate and normalize tags
        valid_tags = [t for t in tags if t in LEARNING_TAGS]
        if not valid_tags:
            valid_tags = ["autonomous"]  # Default tag
        
        event = BehaviorEvent(
            timestamp=timestamp_now(),
            agent_id=agent_id,
            event_type=event_type,
            tags=valid_tags,
            phase=phase if phase in PHASE_TYPES else "implementation",
            outcome=outcome if outcome in ("success", "failure", "partial") else "partial",
            metadata=metadata or {},
            duration_ms=duration_ms,
            iteration=self._iteration,
        )
        
        self._history.append(event)
        
        # Periodically save history
        if len(self._history) % 100 == 0:
            self._save_history()
    
    # =========================================================================
    # Discovery
    # =========================================================================
    
    def discover(self) -> list[dict[str, Any]]:
        """
        Run all pattern detection algorithms and discover new skills.
        
        Returns:
            List of new skill definitions discovered from patterns
        """
        if len(self._history) < 5:
            return []
        
        all_candidates: list[dict[str, Any]] = []
        seen_ids: set[str] = set(skill.id for skill in self._skills.values())
        seen_ids.update(s["id"] for s in self._pending_discoveries)
        
        # Run each pattern detector
        try:
            fis_skills = self._frequent_miner.discover_skills(self._history)
            for skill_def in fis_skills:
                if skill_def["id"] not in seen_ids:
                    all_candidates.append(skill_def)
                    seen_ids.add(skill_def["id"])
        except Exception as e:
            print(f"Warning: Frequent itemset mining failed: {e}", file=sys.stderr)
        
        try:
            sequence_skills = self._sequence_detector.discover_skills(self._history)
            for skill_def in sequence_skills:
                if skill_def["id"] not in seen_ids:
                    all_candidates.append(skill_def)
                    seen_ids.add(skill_def["id"])
        except Exception as e:
            print(f"Warning: Sequence detection failed: {e}", file=sys.stderr)
        
        try:
            anti_skills = self._anti_pattern_detector.discover_skills(self._history)
            for skill_def in anti_skills:
                if skill_def["id"] not in seen_ids:
                    all_candidates.append(skill_def)
                    seen_ids.add(skill_def["id"])
        except Exception as e:
            print(f"Warning: Anti-pattern detection failed: {e}", file=sys.stderr)
        
        try:
            cluster_skills = self._clusterer.discover_skills(self._history)
            for skill_def in cluster_skills:
                if skill_def["id"] not in seen_ids:
                    all_candidates.append(skill_def)
                    seen_ids.add(skill_def["id"])
        except Exception as e:
            print(f"Warning: Behavior clustering failed: {e}", file=sys.stderr)
        
        try:
            rule_skills = self._rule_generator.discover_skills(self._history)
            for skill_def in rule_skills:
                if skill_def["id"] not in seen_ids:
                    all_candidates.append(skill_def)
                    seen_ids.add(skill_def["id"])
        except Exception as e:
            print(f"Warning: Rule-based generation failed: {e}", file=sys.stderr)
        
        # Sort by confidence/quality
        def skill_quality(s: dict[str, Any]) -> float:
            pattern_data = s.get("pattern", {}).get("data", {})
            
            if s["pattern"]["detection_type"] == DetectionType.FREQUENT_ITEMSET.value:
                return pattern_data.get("confidence", 0) * pattern_data.get("lift", 0)
            elif s["pattern"]["detection_type"] == DetectionType.SUCCESS_SEQUENCE.value:
                return pattern_data.get("support", 0) * 2
            elif s["pattern"]["detection_type"] == DetectionType.ANTI_PATTERN.value:
                return pattern_data.get("failure_rate", 0)
            elif s["pattern"]["detection_type"] == DetectionType.BEHAVIOR_CLUSTER.value:
                return pattern_data.get("avg_success_rate", 0)
            elif s["pattern"]["detection_type"] == DetectionType.RULE_BASED.value:
                return min(pattern_data.get("match_count", 0) / 10, 1.0)
            
            return 0.5
        
        all_candidates.sort(key=skill_quality, reverse=True)
        
        # Store pending discoveries
        self._pending_discoveries = all_candidates
        
        # Return top candidates
        return all_candidates[:10]
    
    # =========================================================================
    # Skill Management
    # =========================================================================
    
    def get_skills(self) -> list[dict[str, Any]]:
        """
        Get all active skills.
        
        Returns:
            List of skill dictionaries
        """
        return [
            skill.to_dict()
            for skill in sorted(
                self._skills.values(),
                key=lambda s: (s.active, s.success_rate),
                reverse=True,
            )
            if skill.active
        ]
    
    def get_all_skills(self) -> list[dict[str, Any]]:
        """
        Get all skills including inactive ones.
        
        Returns:
            List of all skill dictionaries
        """
        return [skill.to_dict() for skill in self._skills.values()]
    
    def get_skill(self, skill_id: str) -> dict[str, Any] | None:
        """
        Get a specific skill by ID.
        
        Args:
            skill_id: ID of the skill to retrieve
            
        Returns:
            Skill dictionary or None if not found
        """
        skill = self._skills.get(skill_id)
        return skill.to_dict() if skill else None
    
    def apply_skill(self, skill_id: str) -> bool:
        """
        Mark a skill as being applied/used.
        
        Args:
            skill_id: ID of the skill to apply
            
        Returns:
            True if skill was found and applied, False otherwise
        """
        # Check pending discoveries first
        for pending in self._pending_discoveries:
            if pending["id"] == skill_id:
                # Convert pending to actual skill
                skill = Skill(
                    id=pending["id"],
                    name=pending["name"],
                    description=pending["description"],
                    pattern=Pattern(
                        detection_type=DetectionType(pending["pattern"]["detection_type"]),
                        data=pending["pattern"]["data"],
                    ),
                )
                self._add_skill(skill)
                self._pending_discoveries = [
                    p for p in self._pending_discoveries if p["id"] != skill_id
                ]
                return True
        
        # Check existing skills
        skill = self._skills.get(skill_id)
        if skill is None:
            return False
        
        skill.last_used = timestamp_now()
        self._save_skills()
        return True
    
    def _add_skill(self, skill: Skill) -> None:
        """Add a skill, pruning if necessary."""
        # Check for overflow
        if len(self._skills) >= self.max_skills:
            self._prune_lowest_success_rate()
        
        self._skills[skill.id] = skill
        self._save_skills()
    
    def _prune_lowest_success_rate(self) -> None:
        """Remove skills with lowest success rate to make room."""
        if not self._skills:
            return
        
        # Find inactive skills first
        inactive = [s for s in self._skills.values() if not s.active]
        if inactive:
            # Remove one inactive skill
            to_remove = min(inactive, key=lambda s: s.success_rate)
        else:
            # Remove lowest success rate active skill
            to_remove = min(
                self._skills.values(),
                key=lambda s: (s.success_rate, s.total_uses),
            )
        
        del self._skills[to_remove.id]
        print(f"Pruned skill: {to_remove.id} (success_rate={to_remove.success_rate:.2f})")
    
    # =========================================================================
    # Evaluation
    # =========================================================================
    
    def evaluate_skill(self, skill_id: str) -> dict[str, Any]:
        """
        Evaluate the effectiveness of a skill.
        
        Args:
            skill_id: ID of the skill to evaluate
            
        Returns:
            Evaluation result with verdict and delta
        """
        skill = self._skills.get(skill_id)
        if skill is None:
            return EvaluationResult(
                verdict="unknown",
                delta=0.0,
                confidence=0.0,
                sample_size=0,
                details={"error": "Skill not found"},
            ).to_dict()
        
        total = skill.total_uses
        
        if total < 3:
            return EvaluationResult(
                verdict="insufficient_data",
                delta=0.0,
                confidence=0.0,
                sample_size=total,
                details={"message": "Need at least 3 uses for evaluation"},
            ).to_dict()
        
        # Calculate confidence based on sample size
        confidence = min(total / 20, 1.0)  # Max confidence at 20 uses
        
        # Determine verdict based on success rate
        success_rate = skill.success_rate
        
        if success_rate >= 0.75:
            verdict = "effective"
        elif success_rate >= 0.4:
            verdict = "neutral"
        else:
            verdict = "harmful"
        
        # Calculate delta (improvement potential)
        # Compare to baseline success rate from history
        baseline_rate = self._calculate_baseline_success_rate()
        delta = success_rate - baseline_rate
        
        # Deactivate harmful skills
        if verdict == "harmful" and total >= 10:
            skill.active = False
            self._save_skills()
        
        return EvaluationResult(
            verdict=verdict,
            delta=delta,
            confidence=confidence,
            sample_size=total,
            details={
                "success_rate": success_rate,
                "baseline_rate": baseline_rate,
                "success_count": skill.success_count,
                "failure_count": skill.failure_count,
            },
        ).to_dict()
    
    def _calculate_baseline_success_rate(self) -> float:
        """Calculate baseline success rate from all history."""
        if not self._history:
            return 0.5
        
        successes = sum(1 for e in self._history if e.outcome == "success")
        return successes / len(self._history)
    
    def record_outcome(self, skill_id: str, success: bool) -> None:
        """
        Record the outcome of applying a skill.
        
        Args:
            skill_id: ID of the skill that was applied
            success: Whether the application was successful
        """
        skill = self._skills.get(skill_id)
        if skill is None:
            return
        
        if success:
            skill.success_count += 1
        else:
            skill.failure_count += 1
        
        skill.last_used = timestamp_now()
        self._save_skills()
    
    # =========================================================================
    # Tick / Auto-Discovery
    # =========================================================================
    
    def tick(self) -> bool:
        """
        Advance the discovery tick counter.
        
        Auto-discovery runs every tick_interval iterations.
        
        Returns:
            True if discovery was triggered, False otherwise
        """
        self._iteration += 1
        
        if self._iteration % self.tick_interval == 0:
            self.discover()
            return True
        
        return False
    
    @property
    def iteration(self) -> int:
        """Current iteration count."""
        return self._iteration
    
    @property
    def pending_count(self) -> int:
        """Number of pending discoveries."""
        return len(self._pending_discoveries)
    
    # =========================================================================
    # Statistics
    # =========================================================================
    
    def get_statistics(self) -> dict[str, Any]:
        """
        Get discovery system statistics.
        
        Returns:
            Dictionary of statistics
        """
        skills = list(self._skills.values())
        
        active_skills = [s for s in skills if s.active]
        effective_skills = [s for s in skills if s.success_rate >= 0.75]
        neutral_skills = [s for s in skills if 0.4 <= s.success_rate < 0.75]
        harmful_skills = [s for s in skills if 0 < s.total_uses < 0.4]
        
        return {
            "total_skills": len(skills),
            "active_skills": len(active_skills),
            "effective_skills": len(effective_skills),
            "neutral_skills": len(neutral_skills),
            "harmful_skills": len(harmful_skills),
            "pending_discoveries": len(self._pending_discoveries),
            "history_size": len(self._history),
            "iteration": self._iteration,
            "average_success_rate": (
                sum(s.success_rate for s in skills) / len(skills)
                if skills else 0.0
            ),
            "pattern_detectors": {
                "frequent_itemset": len(self._frequent_miner.frequent_itemsets),
                "success_sequences": len(self._sequence_detector.sequences),
                "anti_patterns": len(self._anti_pattern_detector.anti_patterns),
                "behavior_clusters": len(self._clusterer.clusters),
            },
        }
    
    def reset(self, hard: bool = False) -> None:
        """
        Reset discovery state.
        
        Args:
            hard: If True, also clear skills. Otherwise just resets history.
        """
        self._iteration = 0
        self._history.clear()
        self._pending_discoveries.clear()
        
        if hard:
            self._skills.clear()
        
        self._save_history()
        if hard:
            self._save_skills()
    
    # =========================================================================
    # Import/Export
    # =========================================================================
    
    def export_skills(self, path: Path | None = None) -> bool:
        """
        Export skills to a file.
        
        Args:
            path: Path to export to (defaults to skills_path)
            
        Returns:
            True if export succeeded
        """
        export_path = path or self.skills_path
        return save_json(export_path, [s.to_dict() for s in self._skills.values()])
    
    def import_skills(self, path: Path) -> int:
        """
        Import skills from a file.
        
        Args:
            path: Path to import from
            
        Returns:
            Number of skills imported
        """
        data = load_json(path)
        if data is None:
            return 0
        
        skills_list = data if isinstance(data, list) else data.get("skills", [])
        imported = 0
        
        for skill_dict in skills_list:
            try:
                skill = Skill.from_dict(skill_dict)
                self._skills[skill.id] = skill
                imported += 1
            except (KeyError, TypeError):
                continue
        
        if imported > 0:
            self._save_skills()
        
        return imported
    
    # =========================================================================
    # Context Manager Support
    # =========================================================================
    
    def __enter__(self) -> "SkillDiscoverer":
        return self
    
    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self._save_skills()
        self._save_history()


# ==============================================================================
# Convenience Functions
# ==============================================================================

def create_discoverer(
    skills_path: str | Path | None = None,
    history_path: str | Path | None = None,
) -> SkillDiscoverer:
    """
    Create a SkillDiscoverer instance with optional custom paths.
    
    Args:
        skills_path: Custom path for skills file
        history_path: Custom path for history file
        
    Returns:
        Configured SkillDiscoverer instance
    """
    return SkillDiscoverer(
        skills_path=Path(skills_path) if skills_path else None,
        history_path=Path(history_path) if history_path else None,
    )


def load_discoverer(
    skills_path: str | Path | None = None,
    history_path: str | Path | None = None,
) -> SkillDiscoverer:
    """
    Load an existing SkillDiscoverer from disk.
    
    Alias for create_discoverer since it always loads existing data.
    """
    return create_discoverer(skills_path, history_path)


# ==============================================================================
# Main Entry Point
# ==============================================================================

if __name__ == "__main__":
    # Simple self-test
    print("SkillDiscoverer self-test")
    print("=" * 50)
    
    discoverer = SkillDiscoverer()
    
    # Generate synthetic test events
    import random
    random.seed(42)
    
    agents = ["AgentA", "AgentB", "AgentC"]
    phases = PHASE_TYPES
    
    for i in range(100):
        agent = random.choice(agents)
        phase = random.choice(phases)
        
        # Create correlated tags based on phase
        if phase == "investigation":
            tags = random.sample(["investigative", "pattern_recognition", "data_handling"], 2)
        elif phase == "planning":
            tags = random.sample(["architectural", "planning", "strategy_adaptation"], 2)
        elif phase == "implementation":
            tags = random.sample(["autonomous", "refactoring", "performance"], 2)
        elif phase == "verification":
            tags = random.sample(["testing", "debugging", "error_recovery"], 2)
        else:
            tags = random.sample(LEARNING_TAGS, 2)
        
        # Success rate varies by phase
        if phase in ("verification", "planning"):
            outcome = random.choices(["success", "failure"], weights=[0.8, 0.2])[0]
        else:
            outcome = random.choices(["success", "failure", "partial"], weights=[0.6, 0.2, 0.2])[0]
        
        discoverer.record_event(
            agent_id=agent,
            event_type="task_execution",
            tags=tags,
            phase=phase,
            outcome=outcome,
            duration_ms=random.uniform(100, 5000),
        )
    
    print(f"Recorded {len(discoverer._history)} events")
    
    # Run discovery
    discoveries = discoverer.discover()
    print(f"\nDiscovered {len(discoveries)} potential skills:")
    
    for d in discoveries[:5]:
        print(f"  - {d['name']}: {d['description'][:80]}...")
    
    # Apply some discoveries
    for d in discoveries[:3]:
        if discoverer.apply_skill(d["id"]):
            print(f"\nApplied skill: {d['name']}")
    
    # Show statistics
    stats = discoverer.get_statistics()
    print(f"\nStatistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # Show all skills
    skills = discoverer.get_skills()
    print(f"\nActive skills: {len(skills)}")
    
    print("\nSelf-test complete!")
