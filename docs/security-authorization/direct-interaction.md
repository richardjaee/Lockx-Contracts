# Direct contract interaction

Prefer calling the contracts directly over relying on a web UI. Examples:

```
cast send --private-key $PK \
  --value 1ether \
  $LOCKX "lock(address,uint256,uint40)" 0x0000000000000000000000000000000000000000 0 0
```
