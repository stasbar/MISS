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

https://swimlanes.io/#7VPBjtMwED3jr5gLYjdoy5ZjDkilq5W4cIDCFbnJWDZ17GBPyEaIf2fspM3SlAsHuGxVJa395vmN35tNR9qHmzeb/C5hG1ASgnQ1tN3emsoO44+oQRmLYnNeIG3V2VSjZdSn7Y+NDARb7yjIikogf0AHAb91GEn8vrtEbzVWBzAqc4K0LKoeAB9MpJi19ZrZehnBykhApkGIbUJhLYwqx7oJv+8ITATniZms77FmNRMcBiTx7EzO3NwH/IoVXTEyenctkE8+135B/OlGktJIPiA47KEo8iUUBfSGNP/Fh9YErDfES0XhfP9yrYtiecCshrrgZh5xuu37tyXsNDfJ32bIpyWzGGqNOzB9UqKRhTBgrv8UcSq+872znu8jezyup+fC33HrvOXPGIwaHnX4XVpTGxpA+XCUkuqX7f3Z+5ltMnLJlawek1V7jO4FjVBgICNguuALBo+9KWkjCkjRQBiXdhga47jdFbxzis03nsmxShHAmBKw9GespNCheMSUnlBJlzZSRpM9WX12/2r96j0UsL69fX4NFQaSxtEgxJeSu7sPvmFRPfQJbS1Y71tm4JCnAXIVxuT+arUq4YeS8Sa2xjkMP+EOrRxgj+oYuinmfHbrYzR7i6nyaUz/y5jumJFyyv52Vk8MTwP7rwf29cWBzTMoFXtyjGqdRlCMHwDxCw==
