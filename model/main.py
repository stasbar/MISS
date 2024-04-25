import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random

MAX_ACKNOWLEDGE_COUNT = 16
THEFT_MAX_ACKNOWLEDGE_COUNT = 4
STEPS_PER_EPISODE = 64
MAX_NEIGHBOURS = 10

class MultiAgentCommunicatingEnv(gym.Env):
    metadata = {'render.modes': ['console']}

    def __init__(self, num_agents=5):
        super().__init__()
        self.num_agents = num_agents
        self.action_space = spaces.Discrete(3)
        self.observation_space = spaces.Tuple([
            spaces.Discrete(MAX_ACKNOWLEDGE_COUNT),
            spaces.Discrete(STEPS_PER_EPISODE),
            spaces.Discrete(MAX_NEIGHBOURS),
            spaces.Discrete(MAX_NEIGHBOURS),
            spaces.Discrete(MAX_NEIGHBOURS)
        ])
        self.reset()

    def reset(self):
        self.acknowledge_count = 0
        self.current_step = 0
        self.is_legit = random.choice([True, False])
        self.actions_last = np.full(self.num_agents, 2)
        return self.calculate_obs()

    def step(self, actions):
        self.current_step = min(self.current_step + 1, STEPS_PER_EPISODE - 1)
        self.acknowledge_count = min(self.acknowledge_count + 1, MAX_ACKNOWLEDGE_COUNT if self.is_legit else THEFT_MAX_ACKNOWLEDGE_COUNT)
        self.actions_last = actions

        rewards = []
        dones = []
        for action in actions:
            if action == 2:
                rewards.append(-1)  # Suspend penalty
                dones.append(False)
            else:
                correct = (action == 0 and self.is_legit) or (action == 1 and not self.is_legit)
                rewards.append(10 if correct else -10)
                dones.append(True)  # Decision made, mark done

        return self.calculate_obs(), rewards, dones, {}

    def calculate_obs(self):
        counts = np.bincount(self.actions_last, minlength=3)
        return (
            self.acknowledge_count,
            self.current_step,
            min(counts[2], MAX_NEIGHBOURS),
            min(counts[0], MAX_NEIGHBOURS),
            min(counts[1], MAX_NEIGHBOURS)
        )

    def render(self, mode='console'):
        print(f"Step: {self.current_step}, Actions: {self.actions_last}, Legit: {self.is_legit}")

LEARNING_RATE = 0.1
DISCOUNT_RATE = 0.95

class QLearningAgent:
    def __init__(self, action_space):
        self.q_table = np.random.rand(MAX_ACKNOWLEDGE_COUNT+1, STEPS_PER_EPISODE+1, MAX_NEIGHBOURS+1, MAX_NEIGHBOURS+1, MAX_NEIGHBOURS+1, action_space.n) * 0.01
        self.action_space = action_space

    def choose_action(self, state, epsilon=0.1):
        if random.uniform(0, 1) < epsilon:
            return 2 # 'Suspend'
        else:
            return np.argmax(self.q_table[state])

    def update_q_table(self, state, action, reward, next_state, done):
        current_q = self.q_table[state + (action,)]
        next_max = np.max(self.q_table[next_state]) if not done else 0
        self.q_table[state + (action,)] = (1-LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT_RATE * next_max)


# Initialize the environment and agents
AGENTS_COUNT = 5
env = MultiAgentCommunicatingEnv(num_agents=AGENTS_COUNT)
agents = [QLearningAgent(env.action_space) for _ in range(env.num_agents)]
EPISODES = 10000

for episode in range(EPISODES):
    state = env.reset()
    total_rewards = [0] * env.num_agents
    dones = [False] * env.num_agents
    completed = [False] * env.num_agents  # Track completion status of each agent

    while not all(dones):
        actions = [agents[i].choose_action(state) for i in range(env.num_agents)]
        next_state, rewards, dones, _ = env.step(actions)

        for i in range(env.num_agents):
            if not completed[i]:  # Only update total rewards and Q-table for agents not yet completed
                agents[i].update_q_table(state, actions[i], rewards[i], next_state, dones[i])
                total_rewards[i] += rewards[i]

                # Check if the agent has made a decision that completes their participation
                if actions[i] in [0, 1]:  # Accept or Reject
                    completed[i] = True
                elif dones[i]:
                    completed[i] = True  # Mark completed if the episode is done for other reasons

        state = next_state

    if episode % 100 == 0:
        print(f"Episode: {episode}, Total Rewards: {total_rewards}")

env.close()
