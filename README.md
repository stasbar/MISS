# MISS
How to prevent infection caused by stolen private key.


```uml
Author->Author: Create and publicly publish file
Author->Author: Calculate hash
Author->Blockchain: token request
Blockchain->Blockchain: Check if hash already exists and when was last time spreaded
if: hash exists but is not allowed to spread yet
	Blockchain-->Author: Reject(reason)
end 
Blockchain-->Blockchain: Calculate and store new **token** with **expiredAt** **now+1h**
Blockchain-->Author: Return **token**

Author->FB: This is my new file **link** and here is **token**
User->FB: Download file
User->User: Calculate hash
User->Blockchain: Verify **token** validity for file **hash**
Blockchain->Blockchain: Check if **token** exists for file **hash**
if: token doesn't exist or has expired
	Blockchain-->User: false
  note User: Terminate. Infection decreases
end
Blockchain->Blockchain: Expire token
Blockchain-->User: true
note User: User can trust this file
```
