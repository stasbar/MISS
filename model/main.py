import numpy as np
import networkx as nx
import numpy as np

# Create a random network of 100 agents
num_agents = 100
G = nx.erdos_renyi_graph(n=num_agents, p=0.05)  # Using Erdős-Rényi model for simplicity

# Initialize properties for each agent
lambdas = np.random.dirichlet(np.ones(num_agents))  # Probability distribution of message origination
thetas = np.random.uniform(0.1, 0.5, size=num_agents)  # Vulnerability to private key theft
phis = np.random.exponential(scale=1.0, size=num_agents)  # Time until key theft detected

# Assign properties to each node in the graph
for i in range(num_agents):
    G.nodes[i]['lambda'] = lambdas[i]
    G.nodes[i]['theta'] = thetas[i]
    G.nodes[i]['phi'] = phis[i]

def generate_message():
    # Select the originating agent based on lambda distribution
    origin_agent = np.random.choice(num_agents, p=lambdas)
    is_malicious = np.random.rand() < thetas[origin_agent]  # Decide if the message is fake
    
    # Determine the duration for which a malicious agent can send proofs-of-time
    phi_duration = np.random.exponential(scale=phis[origin_agent]) if is_malicious else np.inf
    
    # Message structure
    message = {
        'origin': origin_agent,
        'is_malicious': is_malicious,
        'phi_duration': phi_duration,
        'proofs_of_time': [],  # Empty list to be filled with proofs-of-time
        'decisions': []  # Record of decisions made by agents on this message
    }
    return message

def propagate_message(G, message):
    origin = message['origin']
    neighbors = list(G.neighbors(origin))
    
    # Forward the message to all neighbors
    for neighbor in neighbors:
        # Here, we would implement the logic to decide on the message based on the RL model
        pass  # Placeholder for decision-making logic

for _ in range(1000):  # Number of messages/events to simulate
    message = generate_message()
    propagate_message(G, message)
