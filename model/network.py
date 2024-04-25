import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random

MAX_ACKNOWLEDGE_COUNT = 32
STEPS_PER_EPISODE = 64

AVERAGE_THEFT_MAX_ACKNOWLEDGE_COUNT = 5
STANDARD_DEVIATION_ACKNOWLEDGE_COUNT = 2

MAX_NEIGHBOURS = 5
AVERAGE_NEIGHBOURS = 2  # Mean for the normal distribution
STANDARD_DEVIATION_NEIGHBOURS = 1  # Standard deviation for the normal distribution


LEARNING_RATE = 0.1
DISCOUNT_RATE = 0.95

class MultiAgentCommunicatingEnv(gym.Env):
    metadata = {'render.modes': ['console']}

    def __init__(self, num_agents=5, avg_neighbours=3, std_dev_neighbours=1):
        super().__init__()
        self.num_agents = num_agents
        self.action_space = spaces.Discrete(3)
        self.avg_neighbours = avg_neighbours
        self.std_dev_neighbours = std_dev_neighbours
        self.observation_space = spaces.Dict({
            "acknowledge_count": spaces.Discrete(MAX_ACKNOWLEDGE_COUNT),
            "current_step": spaces.Discrete(STEPS_PER_EPISODE),
            "neighbor_suspended": spaces.Discrete(MAX_NEIGHBOURS + 1),
            "neighbor_accepted": spaces.Discrete(MAX_NEIGHBOURS + 1),
            "neighbor_rejected": spaces.Discrete(MAX_NEIGHBOURS + 1)
        })
        self.reset()

    def reset(self):
        self.acknowledge_count = 0
        self.current_step = 0
        self.is_legit = random.choice([True, False])
        self.actions_last = np.full(self.num_agents, 2)  # Initialize with 'Suspend'
        self.network = self.generate_network()  # Optionally regenerate network each episode

        theft_count = np.random.normal(AVERAGE_THEFT_MAX_ACKNOWLEDGE_COUNT, STANDARD_DEVIATION_ACKNOWLEDGE_COUNT)
        self.theft_max_acknowledge_count = max(0, int(round(theft_count)))  # Ensure non-negative and integer

        return self.calculate_obs()

    def generate_network(self):
        """ Generate a random network where each agent has up to `max_neighbours` neighbors. """
        network = {}
        all_agents = list(range(self.num_agents))
        for agent in all_agents:
            possible_neighbours = all_agents[:]
            possible_neighbours.remove(agent)
            
            # Sample the number of neighbours from a normal distribution
            num_neighbours = int(round(np.random.normal(AVERAGE_NEIGHBOURS, STANDARD_DEVIATION_NEIGHBOURS)))
            # Ensure the number of neighbours is at least 1 and at most MAX_NEIGHBOURS
            num_neighbours = max(1, min(MAX_NEIGHBOURS, num_neighbours))
            
            # Randomly select neighbors
            neighbors = random.sample(possible_neighbours, num_neighbours)
            network[agent] = neighbors

        return network



    def step(self, actions):
        self.current_step = min(self.current_step + 1, STEPS_PER_EPISODE - 1)
        if self.is_legit:
            self.acknowledge_count = min(self.acknowledge_count + 1, MAX_ACKNOWLEDGE_COUNT)
        else:
            self.acknowledge_count = min(self.acknowledge_count + 1, self.theft_max_acknowledge_count)
        self.actions_last = actions
        rewards, dones = self.calculate_rewards_and_dones(actions)
        return self.calculate_obs(), rewards, dones, {}


    def calculate_obs(self):
        """ Generate observations based only on visible neighbors' actions. """
        observations = {}
        for agent in range(self.num_agents):
            # Filter actions based on the network
            neighbor_indices = self.network[agent]
            neighbor_actions = self.actions_last[neighbor_indices]  # Correct indexing using numpy array
            action_counts = np.bincount(neighbor_actions, minlength=3)
            
            observations[agent] = {
                "acknowledge_count": self.acknowledge_count,
                "current_step": self.current_step,
                "neighbor_suspended": action_counts[2],
                "neighbor_accepted": action_counts[0],
                "neighbor_rejected": action_counts[1]
            }
        return observations

    def calculate_rewards_and_dones(self, actions):
        rewards = []
        dones = []
        for action in actions:
            if action == 2:
                rewards.append(-1)
                dones.append(False)
            else:
                correct = (action == 0 and self.is_legit) or (action == 1 and not self.is_legit)
                rewards.append(15 if correct else -15)
                dones.append(True)
        return rewards, dones

    def render(self, mode='console'):
        print(f"Step: {self.current_step}, Actions: {self.actions_last}, Legit: {self.is_legit}, Network: {self.network}")


# Universal Q-table
universal_q_table = np.random.rand(MAX_ACKNOWLEDGE_COUNT+1, STEPS_PER_EPISODE+1, MAX_NEIGHBOURS+1, MAX_NEIGHBOURS+1, MAX_NEIGHBOURS+1, 3) * 0.01

class QLearningAgent:
    def __init__(self, action_space):
        self.action_space = action_space

    def choose_action(self, state, epsilon=0.1):
        """
        Choose an action based on the current state using an epsilon-greedy policy.
        """
        # Convert state dictionary to tuple for indexing the Q-table
        state_index = (
            state['acknowledge_count'],
            state['current_step'],
            state['neighbor_suspended'],
            state['neighbor_accepted'],
            state['neighbor_rejected']
        )
        if random.uniform(0, 1) < epsilon:
            return 2  # Explore: choose a random action
        else:
            return np.argmax(universal_q_table[state_index])  # Exploit: choose the best action based on current policy

    def update_q_table(self, state, action, reward, next_state, done):
        """
        Update the Q-table using the learning rule based on the transition.
        """
        # Convert state and next_state dictionaries to tuples for indexing the Q-table
        state_index = (
            state['acknowledge_count'],
            state['current_step'],
            state['neighbor_suspended'],
            state['neighbor_accepted'],
            state['neighbor_rejected'],
            action
        )
        next_state_index = (
            next_state['acknowledge_count'],
            next_state['current_step'],
            next_state['neighbor_suspended'],
            next_state['neighbor_accepted'],
            next_state['neighbor_rejected']
        )
        # Standard Q-learning update
        current_q = universal_q_table[state_index]
        next_max = np.max(universal_q_table[next_state_index]) if not done else 0
        universal_q_table[state_index] = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT_RATE * next_max)


env = MultiAgentCommunicatingEnv(num_agents=10)
agents = [QLearningAgent(env.action_space) for _ in range(env.num_agents)]
EPISODES = 10000

for episode in range(EPISODES):
    states = env.reset()  # This should return a dictionary of states keyed by agent indices
    total_rewards = [0] * env.num_agents
    dones = [False] * env.num_agents
    completed = [False] * env.num_agents
    actions = np.full(env.num_agents, 2, dtype=int)
    while not all(dones):
        for i in range(env.num_agents):
            agent_state = states[i]  # Get the state for each agent
            if not dones[i]:
                action = agents[i].choose_action(agent_state)
                actions[i] = action

        next_states, rewards, dones, _ = env.step(actions)

        for i in range(env.num_agents):
            if not completed[i]:
                # Extract neighbor actions from next_states[i]['actions']
                agents[i].update_q_table(states[i], actions[i], rewards[i], next_states[i], dones[i])
                total_rewards[i] += rewards[i]  # Update total rewards for this agent
                # Mark as completed if the agent decided or the episode naturally ended
                if actions[i] in [0, 1] or dones[i]:
                    completed[i] = True

        states = next_states

    if episode % 100 == 0:
        print(f"Episode: {episode}, Total Rewards: {total_rewards}")

env.close()
