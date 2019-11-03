# MISS
How to prevent infection caused by stolen private key.


```uml
Author->Author: Create and publicly publish file
Author->Author: Calculate hash
Author->Smart Contract: token request
Smart Contract->Smart Contract: Check if hash already exists and when was last time spreaded
if: hash exists but is not allowed to spread yet
	Smart Contract-->Author: Reject(reason)
end 
Smart Contract-->Smart Contract: Calculate and store new **token** with **expiredAt** **now+1h**
Smart Contract-->Author: Return **token**

Author->FB: This is my new file **link** and here is **token**
User->FB: Download file
User->User: Calculate hash
User->Smart Contract: Verify **token** validity for file **hash**
Smart Contract->Smart Contract: Check if **token** exists for file **hash**
if: token doesn't exist or has expired
	Smart Contract-->User: false
  note User: Terminate. Infection decreases
end
Smart Contract-->User: true
note User: User can trust this file with (1/N * 100%) certainty

_: **From now we will loop the sequences**

...: {fas-spinner} Delay before new spread is possible**


Author->Smart Contract: token request
Smart Contract->Smart Contract: Check if hash already exists and when was last time spreaded
if: hash exists but is not allowed to spread yet
	Smart Contract-->Author: Reject(reason)
end 
Smart Contract-->Smart Contract: Calculate and store new **token** with **expiredAt** **now+1h**
Smart Contract-->Author: Return **token**

Author->Twitter: This is my new file **link** and here is **token**
User->Twitter: Download file
User->User: Calculate hash
User->Smart Contract: Verify **token** validity for file **hash**
Smart Contract->Smart Contract: Check if **token** exists for file **hash**
if: token doesn't exist or has expired
	Smart Contract-->User: false
  note User: Terminate. Infection decreases
end
Smart Contract-->User: true
note User: User can trust this file with (2/N * 100%) certainty
...: {fas-spinner} Delay before new spread is possible**

```
