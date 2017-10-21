# toadfish



## Required creep tasks:
* Harvest energy
* Upgrade controller
* Build structures (which structures?) - we can start with some construction macros and move on to having the planner decide
* Attack
* Defend

## Required planner tasks:
* Create creeps
* Maintain creep numbers
* Balance roles
* Plan and "commission" structures
* Manage path-finding load
* Defend territory
* Attack territory

## Planner Strategy

To start with let the planner only care about the room it's in. Later on we can add expansion strategies.

### RC1

* Maximum creep cost: 300
* Just upgrade controller (always implied in later levels, just the main point
  of RC1)
* No additional construction, this is a very temporary phase

### RC2

* Build extensions
* Maximum creep cost: 550
* Start to construct ultra-optimised roads, if needed

### RC3

* Dedicated "cows" now possible (WORK*5)
* Tower construction.
* Build containers to put grazing output
* Initial safe mode tends to end here.

### RC4

* Build Storage.
