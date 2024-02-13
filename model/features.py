import numpy as np
from scipy.stats import entropy

# Discretize number of proof of times
def discretize_proof_of_times(num_proofs):
    buckets = [0, 1, 5, 10, 15, 30, 70, 125, 170, 250]
    for i, bucket in enumerate(buckets):
        if num_proofs <= bucket:
            return i
    return len(buckets)

# Discretize frequency of proof of time postings
def discretize_frequency(frequency):
    if frequency <= 1/30:
        return 0  # rare
    elif frequency <= 1/10:
        return 1  # occasional
    else:
        return 2  # frequent

# Discretize variance of proof of time postings
def discretize_variance(variance):
    if variance <= 10:
        return 0  # low
    elif variance <= 50:
        return 1  # medium
    else:
        return 2  # high

# Discretize acceptance ratio
def discretize_acceptance_ratio(ratio):
    if ratio == 1:
        return 0  # always accepted
    elif ratio > 0.75:
        return 1  # mostly accepted
    elif ratio > 0.25:
        return 2  # mixed
    elif ratio > 0:
        return 3  # mostly rejected
    else:
        return 4  # always rejected

# Calculate entropy of agents forwarding
def calculate_entropy(forwarding_agents):
    values, counts = np.unique(forwarding_agents, return_counts=True)
    return entropy(counts)

# Discretize entropy into 5 buckets
def discretize_entropy(value):
    max_entropy = np.log(5)  # Max possible entropy given 5 agents
    bucket_size = max_entropy / 5
    return min(int(value / bucket_size), 4)

# Example input processing function
def process_inputs(A_i_m, t_m, d_m, p_m_acceptance):
    num_agents_forwarding = len(A_i_m)
    entropy_agents_forwarding = calculate_entropy(A_i_m)
    num_proofs = len(t_m)
    frequency_proofs = 1 / np.mean(np.diff(t_m)) if len(t_m) > 1 else 0  # Example calculation
    variance_proofs = np.var(t_m) if len(t_m) > 1 else 0  # Example calculation
    
    # Example discretization
    state = [
        num_agents_forwarding,  # directly taken
        discretize_entropy(entropy_agents_forwarding),
        discretize_proof_of_times(num_proofs),
        discretize_frequency(frequency_proofs),
        discretize_variance(variance_proofs),
        discretize_acceptance_ratio(np.mean(d_m)),  # General proportion
        discretize_acceptance_ratio(p_m_acceptance)  # Per-publisher proportion
    ]
    return state
