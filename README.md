# MISS
How to prevent infection caused by stolen private key.


```uml
Author->Author: Create and publicly publish file
Author->Author: Calculate **hash**
Author->Smart Contract: token request(**hash**)
Smart Contract->Smart Contract: Check if **hash** already exists and when was last time spreaded
if: hash exists but is not allowed to spread yet
	Smart Contract-->Author: Reject(reason)
end 
Smart Contract-->Smart Contract: Calculate token based on **block hash** and **file hash**
Smart Contract-->Smart Contract: Store new **token** 
Smart Contract-->Smart Contract: expiration[**hash**] += expiration(n)
Smart Contract-->Author: Return **token**

Author->FB: This is my new file **link** and here is **token**
User->FB: Download file
User->User: Calculate hash
User->Smart Contract: Verify **token** validity for file **hash**
Smart Contract->Smart Contract: Check if **token** exists for file **hash** and expiration[**hash**] > NOW
if: token doesn't exist or has expired
	Smart Contract-->User: false
  note User: Terminate. User can not trust this file
end
Smart Contract-->User: true
note User: User can trust this file with (1/N * 100%) certainty



...: {fas-spinner} Delay *delay(n)* h before new spread is possible**

_: **From now we will loop the sequences**

Author->Smart Contract: token request(hash)
...: Create and store token
Smart Contract-->User: true
note User: User can trust this file with (2/N * 100%) certainty

...: {fas-spinner} Delay *delay(n)* h before new spread is possible**

Author->Smart Contract: token request(hash)
...: Create and store token


Smart Contract-->User: true
note User: User can trust this file with (N/N * 100%) certainty

```
https://swimlanes.io/#rVTBjtMwED3jr5gLog3asssx0q5UutpjkdgFDgghJ5kopq4d7AnZCPHvjJ2kDW1399Koair3zfO8N89eNlRZd3GzjO8UVg4lIUhTQN1kWuW663/4CkqlUSwPC6TOGx1qkqSSvkqSHeR+Kx3ByhpyMqcUyG7QgMNfDXqajfC5+B93XLeqMN+AKnc7gNTcZtEBPipPPnbbVszdSg9aegJSWwRfBxQWQpUphMoRnzUEyoOxxEzatlhwbwMcOiTx6qClvdxP+BNzmjHSWzMXyDsf9n9CwM6j3oJMet7SGhaUacvaRlnMliTB5mHlZep7sg7BYMuFkZxpXq7Cx1o5Scqab6On3+Ht9WR9Zo7mMjWBGmf2O4rdyO8+pPBQsbf82XaxrygnSbQym0FihdwyA/b1nz0Oxbe2NdryGGLY+vXwPTUxNDz8dSjsCzpVdhMvfkutCkUdlNaNrZz29rnYjWxDfo64oqyTpt7A+uPXGMB+9IVFb95QzwTMw8C+knN6HLteeim1RwEhsAj90gO6rTLsxiIuQC5NzDO5JsQ/jCA6yAE9nmNPwVAUE8odzwEHtIoqmF29W0MCV5eXr+eQoyOpDHWCn8VikcKfUvoLXytj0P2FW9SSp1CEFycpgQoyLMekDgeN6Wvrvco0hgj9SNnOO2e3rKOFNmyrNWhra26FD3O4NkyOfhq352+YMIN5397kWvPxxETkmZx5f9qZM/lyLq3iTGrXT+WAHwDxDw==
