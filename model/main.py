import gymnasium as gym
from gymnasium import spaces
import numpy as np
import random

class AcknowledgeEnv(gym.Env):
    metadata = {'render.modes': ['console']}

    def __init__(self):
        super(AcknowledgeEnv, self).__init__()
        self.action_space = spaces.Discrete(3)  # 0: Accept, 1: Reject, 2: Suspend
        self.observation_space = spaces.Tuple((
            spaces.Discrete(100),  # Acknowledge count
            spaces.Discrete(100),  # Current step
            spaces.Discrete(3)     # Last action taken by the other agent (0, 1, 2)
        ))

        self.MAX_ACKNOWLEDGE_COUNT = 10
        self.AVERAGE_THEFT_MAX_ACKNOWLEDGE_COUNT = 3  # Average for the Poisson distribution
        self.is_legit = True
        self.acknowledge_count = 0
        self.current_step = 0
        self.last_action_other = 2  # Initialize with 'Suspend' as a neutral action


    def reset(self):
        self.is_legit = random.random() > 0.5
        self.acknowledge_count = 0
        self.current_step = -1
        self.last_action_other = 2  # Reset to neutral action
        # Sample a new threshold for this episode if the news is not legit
        if not self.is_legit:
            self.THEFT_MAX_ACKNOWLEDGE_COUNT = np.random.poisson(self.AVERAGE_THEFT_MAX_ACKNOWLEDGE_COUNT)
        return (self.acknowledge_count, self.current_step, self.last_action_other)


    def step(self, action, action_other):
        self.last_action_other = action_other  # Update based on the other agent's action
        self.current_step += 1

        if self.is_legit:
            self.acknowledge_count += 1
        else:
            if self.acknowledge_count < self.THEFT_MAX_ACKNOWLEDGE_COUNT:
                self.acknowledge_count += 1

        if action == 2:  # Suspend
            reward = -1
            done = False
        else:
            correct_decision = 0 if self.is_legit else 1
            reward = 10 if action == correct_decision else -10
            done = True

        return (self.acknowledge_count, self.current_step, self.last_action_other), reward, done, {}

    def render(self, mode='console'):
        if mode != 'console':
            raise NotImplementedError('Unsupported mode: {}'.format(mode))
        print(f'State: Acknowledge Count={self.acknowledge_count}, Step={self.current_step}, Legit: {self.is_legit}')

DISCOUNT_RATE = 0.95
LEARNING_RATE = 0.1
EPSILON = 0.1

class QLearningAgent:
    def __init__(self, action_space, state_space):
        # Initialize Q-table with a dimension for each part of the state tuple
        self.q_table = np.random.rand(state_space[0].n, state_space[1].n, state_space[2].n, action_space.n) * 0.01
        self.action_space = action_space

    def choose_action(self, state, epsilon=EPSILON):
        acknowledge_count, current_step, last_action_other = state
        if random.uniform(0, 1) < epsilon:
            return 2 # Suspend
        else:
            return np.argmax(self.q_table[acknowledge_count, current_step, last_action_other])

    def update_q_table(self, state, action, reward, next_state, done):
        acknowledge_count, current_step, last_action_other = state
        next_acknowledge_count, next_current_step, next_last_action_other = next_state
        current_q = self.q_table[acknowledge_count, current_step, last_action_other, action]
        next_max = np.max(self.q_table[next_acknowledge_count, next_current_step, next_last_action_other]) if not done else 0
        new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + DISCOUNT_RATE * next_max)
        self.q_table[acknowledge_count, current_step, last_action_other, action] = new_q


# Main Training Loop
env = AcknowledgeEnv()

# Initialize two agents
agent1 = QLearningAgent(env.action_space, env.observation_space)
agent2 = QLearningAgent(env.action_space, env.observation_space)



# Main Training Loop
EPISODES = 10000
for episode in range(EPISODES):
    state = env.reset()
    total_reward1 = 0
    total_reward2 = 0
    done = False
    steps = 0

    while not done:
        action1 = agent1.choose_action(state)
        action2 = agent2.choose_action(state)

        # Environment steps forward based on the actions of both agents
        next_state1, reward1, done, _ = env.step(action1, action2)
        next_state2, reward2, done, _ = env.step(action2, action1)

        # Update Q-tables for both agents
        agent1.update_q_table(state, action1, reward1, next_state1, done)
        agent2.update_q_table(state, action2, reward2, next_state2, done)

        # Update state and rewards
        state = next_state1  # Both next_state1 and next_state2 should be effectively the same
        total_reward1 += reward1
        total_reward2 += reward2
        steps += 1
        

    if episode % 100 == 0:
        print(f"Episode: {episode}, Total Reward: {total_reward}, Steps Taken: {env.current_step}")

env.close()