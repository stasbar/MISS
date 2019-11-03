# MISS
How to prevent infection caused by stolen private key.


```uml
Author->Author: Create and publicly publish file
Author->Author: Calculate hash
Author->Smart Contract: token request(hash)
Smart Contract->Smart Contract: Check if hash already exists and when was last time spreaded
if: hash exists but is not allowed to spread yet
	Smart Contract-->Author: Reject(reason)
end 
Smart Contract-->Smart Contract: Calculate token based on **block hash** and **file hash**
Smart Contract-->Smart Contract: Store new **token** with **expiredAt** **now+1h**
Smart Contract-->Author: Return **token**

Author->FB: This is my new file **link** and here is **token**
User->FB: Download file
User->User: Calculate hash
User->Smart Contract: Verify **token** validity for file **hash**
Smart Contract->Smart Contract: Check if **token** exists for file **hash**
if: token doesn't exist or has expired
	Smart Contract-->User: false
  note User: Terminate. User can not trust this file
end
Smart Contract-->User: true
note User: User can trust this file with (1/N * 100%) certainty



...: {fas-spinner} Delay 1/n h before new spread is possible**

_: **From now we will loop the sequences**

Author->Smart Contract: token request(hash)
...: Create and store token
Smart Contract-->User: true
note User: User can trust this file with (2/N * 100%) certainty

...: {fas-spinner} Delay 1/n h before new spread is possible**

Author->Smart Contract: token request(hash)
...: Create and store token


Smart Contract-->User: true
note User: User can trust this file with (N/N * 100%) certainty

```
https://swimlanes.io/#rVTLbtswEDyXX7GXojaLOHGPOhRwHeSYQ5P2WlDSCmJNkyq5qiIU/fcuScV2bActUBuGH9TscGY40qqn1vmrj6v0XcDaoyIEZWvo+tLoyoz5R2ih0QbF6nhAmao3caZVod1dftgqT7B2lryqqAByG7Tg8UePgWYROhcvMacz6xarDegmMYMyLK0eAZ90oJAUDi1zDiqAUYGA9BYhdBGFtdBNkecmfNkT6ADWETMZN2DNmiY4jEjizZGcvcXP+B0rmjEyODsXyDsfaz8jfpdLtl6qwFs6C1KWxrGvKE7K5EPKGO208nfqB3IeweLAg4mcaQZNLf/Fp057rFfES1JaN7xfnqXcW6Pe2z2P2B3g3acCHltOjN/bMe2WREpptN1MwltkIQzYz38JOA3fusEax+Gm2uT1+HlSmXzp2ORX9LoZDxz+VEbXmkZonH+Wcj6x14u0Z5taccoVe5NPrHYY7DvKUGAgI2AK+ExbsrdGmYACYs8Q8tIj+q22bHeRFqBSNtWQfB9bGzNOEXGvTg8qUzAUxQHljueII9dgtry+BwnLm5u3c6jQk9KWRsGvxWJRwK9GhavQaWvR/4ZbNGqE5bWFFkpsnps13RjM27kQdGkwluNbwUHdebdlAwMMcT9jwDjXsQa++eLtbSsMh0X6lydB0nXw6Amp4Ql5oUg+nI/kfwO5lElxIZv3r508vwDEHw==
